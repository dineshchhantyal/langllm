// src/nodes/notesAgent.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage } from "@langchain/core/messages";
import { AppStateType } from "../state";

const baseModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

const NOTES_SYSTEM = `
You organize and clean rough notes.
Structure key points, highlight action items, and keep phrasing concise.
`.trim();

export async function notesAgentNode(
  state: AppStateType
): Promise<Partial<AppStateType>> {
  const reply = await baseModel.invoke([
    new SystemMessage(NOTES_SYSTEM),
    ...state.messages,
  ]);

  return {
    messages: [reply],
  };
}
