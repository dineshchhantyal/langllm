# LangGraph + Gemini Agents (Bun)

This project runs entirely on Bun and showcases two LangGraph flows backed by Google Gemini:

- **`graph.ts`** – a compact agent with one arithmetic tool.
- **`graph_moe.ts`** – a mixture-of-experts (MoE) router that picks between todo, web, notes, and finance specialists.

## Prerequisites
- Bun 1.1 or later
- Node.js 20 or 22 (required by LangGraph runtime)
- Google Gemini API key with access to the `gemini-2.5-flash` models
- Optional: Tavily API key (`TAVILY_API_KEY`) to enable live web search

## Setup
1. Install dependencies:
   ```bash
   bun install
   ```
2. Create `.env` in the project root:
   ```bash
   GOOGLE_API_KEY=your_gemini_key_here
   TAVILY_API_KEY=your_tavily_key_here   # optional but required for live web search
   ```

## Commands
- Run the single-tool agent:
  ```bash
  bun run src/agent-gemini.ts "Add 3 and 9 and explain"
  ```
- Run the MoE router demo:
  ```bash
  bun run src/run_moe.ts "Help me plan my study todos and check recent S&P performance"
  ```
  ```bash
  bun run moe "Help me plan my study todos and check recent S&P performance"
  ```
  The MoE agent now performs real CRUD operations on a lightweight file-backed task store and, when configured, calls a live web search tool.

## Code Map
- `src/state.ts` – shared LangGraph state with messages, optional goal, and router selection.
- `src/graph.ts` – Gemini + tool binding (`add`) wired through the shared state.
- `src/nodes/` – router node plus four specialist agents with tailored system prompts. The todo and web agents are tool-aware.
- `src/tools/` – LangChain tool definitions (todo CRUD, Tavily search).
- `src/db/taskStore.ts` – file-backed task persistence (`data/tasks.json` is created automatically).
- `src/graph_moe.ts` – composes the router, tool nodes, and specialists into a looping StateGraph.
- `src/run_moe.ts` – CLI runner for the MoE graph.
- `src/agent-gemini.ts` – CLI runner for the single-tool graph.

## LangGraph Studio
`langgraph.json` exposes both graphs:

- `agent` → `./src/graph.ts:graph`
- `moe_agent` → `./src/graph_moe.ts:moeGraph`

Start the dev server and open the printed Studio URL:
```bash
bunx @langchain/langgraph-cli dev
```

### LangGraph Studio Example
When using the MoE agent, you can input:
```json
{"messages":[{"role":"user", "message": "Help me plan my study todos."}]}
```
```json
{"messages":[{"role":"user", "message": "and check recent S&P performance"}]}
```


## Troubleshooting
- **API key errors** – verify `.env` and confirm the key has Gemini access.
- **Missing web search** – set `TAVILY_API_KEY` to enable the Tavily tool. Without it, the web agent returns a placeholder message.
- **Task store issues** – the todo tools read/write `data/tasks.json`. Delete the file if it becomes corrupted.
- **Unexpected router choice** – the router defaults to `notes` if it cannot classify the intent; inspect the inserted system message to debug.
- **Message typing issues** – nodes expect LangChain `BaseMessage` instances; use helpers like `HumanMessage` when invoking graphs manually.
