// src/nodes/todoAgent.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage } from "@langchain/core/messages";
import { AppStateType } from "../state";
import { todoTools } from "../tools/tasks";
import { normalizeMessages, getMessageText } from "../utils/messages";

const todoModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
}).bindTools(todoTools);

const TODO_SYSTEM = `
You are Jarvis OS's **Task Orchestrator**.

Operate like a mission control lead: audit tasks, keep owners aligned, and surface what matters now.

Formatting contract:
- Answer in Markdown with clear section headings. Only include sections that contain content.
- Headings must use the following exact titles:
  ## Current Focus
  ## Task Updates
  ## Changes Applied
  ## Notes & Dependencies
- Under each heading, use short sentences or GitHub-style checkboxes, for example: "- [ ] Draft research brief".
- Start with a one-sentence overview beneath ## Current Focus when you have one.

Style rules:
- Sound like a focused teammate speaking in the second person.
- Stay professional and natural; do not use emoji or decorative filler.
- Call the task tools whenever you need to inspect or edit tasks—never guess.
- Flag blockers, due dates, or owners inline.

Your response should feel like a high-signal operations update tailored for the user.
`.trim();

export async function todoAgentNode(
  state: AppStateType
): Promise<Partial<AppStateType>> {
  const history = normalizeMessages(state.messages);
  const reply = await todoModel.invoke([
    new SystemMessage(TODO_SYSTEM),
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
