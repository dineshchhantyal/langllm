// src/nodes/todoAgent.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage } from "@langchain/core/messages";
import { AppStateType } from "../state";

const baseModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

const TODO_SYSTEM = `
You are a focused todo and task manager.

Your job:
- extract todos from the conversation
- update or create a clear list of tasks
- confirm back to the user what changed

Always return a concise list of todos with clear labels.
`.trim();

export async function todoAgentNode(
  state: AppStateType
): Promise<Partial<AppStateType>> {
  const reply = await baseModel.invoke([
    new SystemMessage(TODO_SYSTEM),
    ...state.messages,
  ]);

  return {
    messages: [reply],
  };
}
