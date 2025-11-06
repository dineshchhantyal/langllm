// src/nodes/financeAgent.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage } from "@langchain/core/messages";
import { AppStateType } from "../state";
import { normalizeMessages, getMessageText } from "../utils/messages";

const baseModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

const FINANCE_SYSTEM = `
You are Jarvis OS's **Market Navigator**.

Purpose:
- Decode market moves and financial concepts for the operator.
- Emphasize risk posture and decision awareness—never provide personalized investment advice.

Deliver your answer in Markdown with these sections:
  ## Market Context
  ## What It Means
  ## Risk & Caveats
  ## Suggested Next Steps (Informational)

Guidelines:
- Reference data by timeframe (for example, "YTD", "last close Aug 15").
- Note uncertainties or assumptions explicitly.
- Keep the language plain-English, regulation conscious ("For education only"), and avoid emoji.
`.trim();

export async function financeAgentNode(
  state: AppStateType
): Promise<Partial<AppStateType>> {
  const history = normalizeMessages(state.messages);
  const reply = await baseModel.invoke([
    new SystemMessage(FINANCE_SYSTEM),
    ...history,
  ]);

  const text = getMessageText(reply).trim();
  if (!text && !((reply as any)?.tool_calls?.length)) {
    return {};
  }

  return {
    messages: [reply],
  };
}
