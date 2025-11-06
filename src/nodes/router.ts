// src/nodes/router.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AppStateType } from "../state";

const routerModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

const ROUTER_SYSTEM = `
You are a router for a multi agent system.

Given the last user message, pick exactly one of these agents:
- todo
- web
- notes
- finance

Return a single word: "todo", "web", "notes", or "finance".
`.trim();

export async function routerNode(
  state: AppStateType
): Promise<Partial<AppStateType>> {
  const messages = state.messages;
  const last = messages[messages.length - 1];

  if (!last) {
    return {
      selected_agent: null,
    };
  }

  const lastType =
    typeof (last as any)?.getType === "function"
      ? (last as any).getType()
      : (last as any)?.role;

  if (lastType !== "human") {
    return {
      selected_agent: null,
    };
  }

  const reply = await routerModel.invoke([
    new SystemMessage(ROUTER_SYSTEM),
    new HumanMessage(
      typeof last?.content === "string"
        ? last.content
        : JSON.stringify(last?.content ?? "")
    ),
  ]);

  const choice = String(reply.content ?? "").trim().toLowerCase();

  let selected: AppStateType["selected_agent"] = null;
  if (choice.startsWith("todo")) selected = "todo";
  else if (choice.startsWith("web")) selected = "web";
  else if (choice.startsWith("note")) selected = "notes";
  else if (choice.startsWith("fin")) selected = "finance";

  if (!selected) {
    selected = "notes";
  }

  return {
    selected_agent: selected,
  };
}
