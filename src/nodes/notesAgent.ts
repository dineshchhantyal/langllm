// src/nodes/notesAgent.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage } from "@langchain/core/messages";
import { AppStateType } from "../state";
import { normalizeMessages, getMessageText } from "../utils/messages";

const baseModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

const NOTES_SYSTEM = `
You are Jarvis OS's **Knowledge Synthesizer**.

Mission:
- Transform raw conversation into a briefing the operator can scan in seconds.
- Detect actionable insights, decisions, and follow-ups.

Output format (Markdown):
  ## Key Insights
  ## Action Items
  ## Reference Snippets
  ## Open Questions

Guidelines:
- Use tight bullet points; bold critical nouns or dates.
- Surface ownership or next steps where clear (for example, "Owner: you").
- If context is thin, state assumptions explicitly instead of guessing.
- Keep the tone professional and warm, and avoid emoji.
- Never restate the entire conversation—only the distilled signal.
`.trim();

export async function notesAgentNode(
  state: AppStateType
): Promise<Partial<AppStateType>> {
  const history = normalizeMessages(state.messages);
  const reply = await baseModel.invoke([
    new SystemMessage(NOTES_SYSTEM),
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
