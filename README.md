# OpenAI Agents Starter

A full-stack EdgeOne Makers Agent template — streaming chat backed by the OpenAI Agents SDK (TypeScript), with custom tools and `context.store`-backed conversation memory.

**Framework:** OpenAI Agents SDK · **Category:** Quick Start <!-- TODO: confirm --> · **Language:** TypeScript

[![Deploy to EdgeOne Makers](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://edgeone.ai/makers/new?template=openai-agents-starter-node&from=within&fromAgent=1&agentLang=typescript)

<!-- ![preview](./assets/preview.png)  TODO: confirm -->

## Overview

A minimal, production-shaped starter that wires `@openai/agents` into EdgeOne Makers. Demonstrates the full chat loop — SSE streaming, custom tool registration, conversation persistence — so you can fork it and start replacing the toy tools (`get_weather`, `get_clothing_advice`, `translate_text`, `text_statistics`) with real ones.

- **SSE streaming chat** — token-by-token `text_delta` events plus `tool_called` events.
- **Custom Agent tools** — four sample tools registered via `createTools()`, ready to be replaced with your own.
- **Sticky conversation memory** — `context.store.openaiSession(conversationId)` plugs straight into the SDK's `session` parameter.
- **Dual cancellation** — frontend `AbortController` plus backend `AbortSignal` interrupts the LLM call mid-stream.
- **Two-folder backend** — long-running stateful work in `agents/`, short stateless `/history` in `cloud-functions/`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AI_GATEWAY_API_KEY` | Yes | Model gateway API key. Use your Makers Models API Key, or any OpenAI-compatible provider key. |
| `AI_GATEWAY_BASE_URL` | Yes | Gateway base URL. For Makers Models, use `https://ai-gateway.edgeone.link/v1`. |
| `AI_GATEWAY_MODEL` | No | Model ID. Defaults to `@makers/deepseek-v4-flash` (a free built-in model). |

This template follows the OpenAI-compatible standard — point these at Makers Models or any compatible provider.

### How to get `AI_GATEWAY_API_KEY`

1. Open the [Makers Console](https://edgeone.ai/makers/new?s_url=https://console.tencentcloud.com/edgeone/makers).
2. Sign in and enable Makers.
3. Go to **Makers → Models → API Key** and create a key.
4. Copy it into `AI_GATEWAY_API_KEY`.

The built-in `@makers/deepseek-v4-flash` model is free with a usage cap and is suitable for prototyping. For production, bind your own paid provider (BYOK).

## Local Development

Prerequisites: Node.js ≥ 18 and the EdgeOne CLI (`npm i -g edgeone`).

```bash
npm install
cp .env.example .env       # then fill in AI_GATEWAY_API_KEY / AI_GATEWAY_BASE_URL
edgeone makers dev
```

Local agent metrics & traces are exposed at `http://localhost:8080/agent-metrics`.

## Project Structure

```text
openAI-agent-starter/
├── agents/                          # Stateful EdgeOne Makers Agent Functions (Node/TS)
│   ├── chat/index.ts               # POST /chat — SSE streaming chat
│   ├── stop/index.ts               # POST /stop — abort active agent run
│   ├── _logger.ts                  # Logger utility (private)
│   ├── _sse.ts                     # SSE helpers (private)
│   └── _tools.ts                   # Agent tool definitions (private)
├── cloud-functions/                 # Stateless EdgeOne Makers Node Functions
│   ├── history/index.ts            # POST /history — load conversation messages
│   └── _logger.ts                  # Logger utility
├── src/                             # React + Vite + TypeScript frontend
│   ├── App.tsx                     # Main app + SSE stream lifecycle
│   ├── api.ts                      # /chat, /stop, /history wrappers
│   └── components/                 # ChatWindow, ChatInput, CodeViewer, ToolIndicators, ...
├── package.json                     # Includes @openai/agents
├── edgeone.json                     # framework=openai-agents-sdk
├── vite.config.ts
├── tsconfig.json
└── .gitignore
```

> Files prefixed with `_` are private modules — not exposed as public routes.

## Resources

- [EdgeOne Makers Agents — Documentation](https://pages.edgeone.ai/document/agents)
- [EdgeOne Makers — Quick Start](https://pages.edgeone.ai/document/agents-quick-start)
- [Makers Models](https://pages.edgeone.ai/document/models)

## License

MIT.
