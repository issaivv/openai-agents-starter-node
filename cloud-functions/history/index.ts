/**
 * History handler — EdgeOne Makers Node Function
 * ==============================================
 *
 * File path cloud-functions/history/index.ts maps to **POST /history**.
 *
 * Reads conversation history from `context.agent!.store.getMessages()` and
 * returns it to the frontend for restoring the chat window after a page
 * refresh.
 *
 * The chat handler writes a user-index copy for the sidebar, while the
 * OpenAI Agents SDK session writes the same user input for model memory.
 * This handler normalizes SDK records, merges same-run assistant fragments,
 * and folds adjacent duplicate bubbles so refresh rehydrates one visible
 * user message per turn.
 *
 * Following the official EdgeOne Makers Node Functions docs:
 *   - export `onRequestPost` for POST handlers
 *   - read JSON body via `await context.request!.json()`
 *   - return a `Response` object
 *   https://pages.edgeone.ai/document/node-functions
 */

import type { CloudFunctionContext } from '@edgeone/types';
import { createLogger } from '../_logger';

const logger = createLogger('history');

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=UTF-8' } as const;

interface MemoryMessage {
  messageId?: string;
  role?: string;
  content?: unknown;
  createdAt?: number;
  metadata?: Record<string, unknown>;
}

interface FrontendMessage {
  id: string;
  role: string;
  content: string;
  timestamp: number;
}

interface NormalizedMessage {
  message: FrontendMessage;
  runId?: string;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

async function readJsonBody(context: CloudFunctionContext): Promise<Record<string, unknown>> {
  try {
    const data = await context.request!.json();
    return data && typeof data === 'object' && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function getConversationId(context: CloudFunctionContext, body: Record<string, unknown>): string {
  const fromBody = body.conversation_id ?? body.conversationId;
  if (typeof fromBody === 'string' && fromBody.trim()) return fromBody.trim();

  // Backwards-compat: also accept the makers-conversation-id header used by /chat.
  try {
    const headerValue = context?.request?.headers?.get?.('makers-conversation-id');
    if (typeof headerValue === 'string' && headerValue.trim()) return headerValue.trim();
  } catch {
    /* noop */
  }
  return '';
}

// ── Content extraction ──────────────────────────────────────

function contentToText(content: unknown): string {
  if (typeof content === 'string') return content;

  if (content !== null && typeof content === 'object' && !Array.isArray(content)) {
    const obj = content as Record<string, unknown>;
    if ('content' in obj) return contentToText(obj.content);
    if ('output' in obj) return contentToText(obj.output);
    if ('text' in obj) return String(obj.text ?? '');
    return '';
  }

  if (Array.isArray(content)) {
    return content
      .filter((item): item is Record<string, unknown> =>
        item !== null && typeof item === 'object',
      )
      .map(item => String(item.text ?? item.output_text ?? ''))
      .filter(Boolean)
      .join('\n');
  }

  return String(content);
}

function normalizeMessage(item: MemoryMessage): NormalizedMessage | null {
  const role = item.role;
  if (role !== 'user' && role !== 'assistant') return null;

  const meta = item.metadata ?? {};
  if (meta.agent_sdk_session) {
    const itemType = meta.item_type as string | null | undefined;
    if (itemType != null && itemType !== 'message') return null;
  }

  const content = contentToText(item.content);
  if (!content) return null;

  return {
    message: {
      id: item.messageId ?? `${role}-${item.createdAt ?? 0}`,
      role,
      content,
      timestamp: item.createdAt ?? 0,
    },
    runId: meta.run_id as string | undefined,
  };
}

function mergeAssistantFragments(items: NormalizedMessage[]): FrontendMessage[] {
  const sorted = [...items].sort((a, b) => a.message.timestamp - b.message.timestamp);

  const merged: FrontendMessage[] = [];
  let lastRunId: string | undefined;

  for (const { message, runId } of sorted) {
    const previous = merged[merged.length - 1];
    const sameRunAssistant = Boolean(
      previous &&
        runId &&
        runId === lastRunId &&
        previous.role === 'assistant' &&
        message.role === 'assistant',
    );

    if (sameRunAssistant) {
      previous.content += `\n\n${message.content}`;
    } else {
      merged.push({ ...message });
      lastRunId = runId;
    }
  }

  return merged;
}

function dedupeAdjacent(messages: FrontendMessage[]): FrontendMessage[] {
  const deduped: FrontendMessage[] = [];

  for (const message of messages) {
    const previous = deduped[deduped.length - 1];
    if (
      previous &&
      previous.role === message.role &&
      previous.content === message.content
    ) {
      continue;
    }
    deduped.push(message);
  }

  return deduped;
}

// ── Handler ─────────────────────────────────────────────────

export async function onRequestPost(context: CloudFunctionContext): Promise<Response> {
  const requestStartTime = Date.now();
  logger.log(`[history] start: ${new Date(requestStartTime).toISOString()}`);

  const body = await readJsonBody(context);
  const conversationId = getConversationId(context, body);
  const { store } = context.agent!;

  logger.log('conversationId:', conversationId || '-');

  if (!conversationId) {
    logger.log(
      `[history] end: ${new Date().toISOString()}, total: ${Date.now() - requestStartTime}ms (no conversationId)`,
    );
    return jsonResponse({ conversation_id: conversationId, messages: [] });
  }

  try {
    const storeStartTime = Date.now();
    logger.log(`[history] store.getMessages start: ${new Date(storeStartTime).toISOString()}`);

    const history: MemoryMessage[] = await store.getMessages({
      conversationId,
      limit: 100,
      order: 'asc',
    });

    const storeEndTime = Date.now();
    logger.log(
      `[history] store.getMessages end: ${new Date(storeEndTime).toISOString()}, duration: ${storeEndTime - storeStartTime}ms (records: ${history.length})`,
    );

    const visible = history
      .map(normalizeMessage)
      .filter((item): item is NormalizedMessage => item !== null);
    const messages = dedupeAdjacent(mergeAssistantFragments(visible));

    logger.log(
      `[history] end: ${new Date().toISOString()}, total: ${Date.now() - requestStartTime}ms (${history.length} raw -> ${visible.length} visible -> ${messages.length} bubbles)`,
    );

    return jsonResponse({ conversation_id: conversationId, messages });
  } catch (e) {
    logger.error('failed to get messages:', e);
    logger.log(`[history] end: ${new Date().toISOString()}, total: ${Date.now() - requestStartTime}ms (error)`);
    return jsonResponse({ conversation_id: conversationId, messages: [] });
  }
}
