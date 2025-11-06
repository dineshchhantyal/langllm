// src/nodes/financeAgent.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage } from "@langchain/core/messages";
import { AppStateType } from "../state";

const baseModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

const FINANCE_SYSTEM = `
You help with personal finance and markets questions.
Explain concepts clearly, mention relevant risks, and avoid giving regulated investment advice.
`.trim();

export async function financeAgentNode(
  state: AppStateType
): Promise<Partial<AppStateType>> {
  const reply = await baseModel.invoke([
    new SystemMessage(FINANCE_SYSTEM),
    ...state.messages,
  ]);

  return {
    messages: [reply],
  };
}
