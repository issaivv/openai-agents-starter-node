/**
 * SSE streaming helper — private module (starts with _), not mapped as a route.
 *
 * Wraps the boilerplate around `new ReadableStream(...)` + abort handling +
 * `done` / `error` framing so handlers only need to `yield` business events.
 *
 * Usage:
 *   return sseResponse(async function* () {
 *     yield { event: 'text_delta', data: { delta: '...' } };
 *     yield { event: 'tool_called', data: { tool: 'get_weather' } };
 *   }, { signal: context.request.signal });
 */

export interface SseEvent {
  event?: string;
  data: unknown;
  id?: string;
  retry?: number;
}

export interface SseResponseOptions {
  /** Name of the terminal frame; set false to disable. Default: 'done'. */
  doneEvent?: string | false;
  /** Name of the error frame; set false to swallow errors. Default: 'error'. */
  errorEvent?: string | false;
  /** Cancel signal — typically `context.request.signal`. */
  signal?: AbortSignal;
  /** Extra response headers, merged on top of the SSE defaults. */
  headers?: Record<string, string>;
  /** Optional logger for abort traces. */
  logger?: { log: (...a: unknown[]) => void; error: (...a: unknown[]) => void };
}

const SSE_HEADERS: Record<string, string> = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
  'X-Accel-Buffering': 'no',
};

function encodeFrame(encoder: TextEncoder, evt: SseEvent): Uint8Array {
  const lines: string[] = [];
  if (evt.event) lines.push(`event: ${evt.event}`);
  if (evt.id) lines.push(`id: ${evt.id}`);
  if (evt.retry != null) lines.push(`retry: ${evt.retry}`);
  lines.push(`data: ${JSON.stringify(evt.data)}`);
  return encoder.encode(lines.join('\n') + '\n\n');
}

/**
 * Wrap an async generator of `SseEvent` into a streaming SSE `Response`.
 *
 * Responsibilities handled here:
 *   - Encode events into SSE wire format and pump into `Response.body`
 *   - Honor `AbortSignal` and break the loop cleanly
 *   - Emit terminal `done` frame and (on failure) `error` frame
 *   - Standard SSE response headers
 */
export function sseResponse(
  generator: () => AsyncGenerator<SseEvent, void, unknown>,
  options: SseResponseOptions = {},
): Response {
  const { doneEvent = 'done', errorEvent = 'error', signal, headers, logger } = options;

  const encoder = new TextEncoder();
  let stopped = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enqueue = (evt: SseEvent) => controller.enqueue(encodeFrame(encoder, evt));
      const iter = generator();
      try {
        let next = await iter.next();
        while (!next.done) {
          if (signal?.aborted) {
            stopped = true;
            break;
          }
          enqueue(next.value);
          next = await iter.next();
        }
      } catch (e: unknown) {
        const err = e as Error & {
          status?: number;
          error?: unknown;
          response?: unknown;
          cause?: unknown;
        };
        if (err?.name === 'AbortError' || signal?.aborted) {
          stopped = true;
          logger?.log('[stream] aborted by user');
        } else {
          logger?.error('[stream] error:', err?.message, err?.stack);
          if (errorEvent) {
            enqueue({
              event: errorEvent,
              data: {
                message: String(err?.message ?? e),
                name: err?.name || 'Error',
                stack: err?.stack,
                status: err?.status,
                detail: err?.error ?? err?.response,
                cause: err?.cause,
              },
            });
          }
        }
      } finally {
        // Best-effort: ask the generator to clean up upstream resources.
        try {
          await iter.return?.(undefined);
        } catch {
          /* ignore */
        }
        if (doneEvent) enqueue({ event: doneEvent, data: { stopped } });
        controller.close();
      }
    },
    cancel() {
      logger?.log('[stream] client disconnected');
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { ...SSE_HEADERS, ...(headers ?? {}) },
  });
}
