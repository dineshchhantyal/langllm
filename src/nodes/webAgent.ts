// src/nodes/webAgent.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage } from "@langchain/core/messages";
import { AppStateType } from "../state";
import { webTools } from "../tools/web";

const webModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
}).bindTools(webTools);

const WEB_SYSTEM = `
You are a research assistant with access to up-to-date web knowledge.
Summarize likely current information, cite recent context if known, and flag uncertainty.
`.trim();

export async function webAgentNode(
  state: AppStateType
): Promise<Partial<AppStateType>> {
  const reply = await webModel.invoke([
    new SystemMessage(WEB_SYSTEM),
    ...state.messages,
  ]);

  return {
    messages: [reply],
  };
}
