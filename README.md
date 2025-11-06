# LangGraph + Gemini Agent (Bun)

This project demonstrates a minimal LangGraph agent that runs locally with Bun and Google Gemini. The agent accepts chat-style messages, can call a single arithmetic tool, and returns the augmented conversation state.

## Prerequisites
- Bun 1.1 or later (installs dependencies and runs the scripts)
- Node.js 20 or 22 available on the system (LangGraph requirement)
- A Google Gemini API key with access to the `gemini-2.5-flash` family

## Setup
1. Install dependencies:
	 ```bash
	 bun install
	 ```
2. Create a `.env` file in the project root:
	 ```bash
	 GOOGLE_API_KEY=your_api_key_here
	 ```

## Commands
- Run the agent once from the command line:
	```bash
	bun run src/agent-gemini.ts "Add 3 and 9 and explain"
	```
	The script logs the final `messages` array returned by the graph, including tool calls and the final assistant reply.

## How It Works
- `src/graph.ts` – builds the LangGraph workflow:
	- Configures Gemini with tool support via `ChatGoogleGenerativeAI`
	- Registers an `add` tool that sums two integers
	- Defines the assistant node that forwards the running message history to Gemini
	- Uses conditional routing to decide whether to execute tools or finish
- `src/agent-gemini.ts` – lightweight Bun CLI entry point that forwards user input to the compiled graph.

## Troubleshooting
- **Invalid or missing API key** – ensure `.env` is present and `GOOGLE_API_KEY` is valid.
- **Unexpected input errors** – the graph expects the input shape `{ "messages": [{ "role": "user", "content": "Add 3 and 9 and explain" }] }`. The CLI already formats this structure.

## Next Steps
- Wrap the script in your own CLI or HTTP server
- Extend `src/graph.ts` with more tools, memory, or additional LangGraph nodes
