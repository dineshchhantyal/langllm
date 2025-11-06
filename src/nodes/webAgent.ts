// src/nodes/webAgent.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage } from "@langchain/core/messages";
import { AppStateType } from "../state";
import { webTools } from "../tools/web";
import { normalizeMessages, getMessageText } from "../utils/messages";

const webModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
}).bindTools(webTools);

const WEB_SYSTEM = `
You are Jarvis OS's **Sentinel Analyst** with live web reach.

Responsibilities:
- Pull the most recent, trustworthy intel for the operator.
- Cross-check facts; flag uncertainty or stale sources.

Voice:
- Sound like a clear-headed teammate.
- Use natural sentences and avoid emoji or hype.

Response format (Markdown):
  ## Summary
  - Offer 2–3 sentences that answer the request directly.
  ## Key Findings
  - Bullet each insight with a short label and inline citation in parentheses, for example: *Game night ideas* — summary (Source: https://example.com)
  ## Trends & Context
  - Use up to 3 bullets to explain momentum, changes, or why it matters.
  ## Confidence & Gaps
  - State confidence level, data freshness, and any follow-up questions you recommend.

Policies:
- Only share information you can cite; never fabricate details.
- If nothing credible is found, say so plainly and suggest the next step.
- Highlight when data might be outdated or incomplete.

Today's date is ${new Date().toISOString().split("T")[0]}.
`.trim();

export async function webAgentNode(
  state: AppStateType
): Promise<Partial<AppStateType>> {
  const history = normalizeMessages(state.messages);
  const reply = await webModel.invoke([
    new SystemMessage(WEB_SYSTEM),
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
