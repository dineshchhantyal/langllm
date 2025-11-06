// src/nodes/router.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AppStateType, AgentValue } from "../state";
import { normalizeMessages, contentToText } from "../utils/messages";

const routerModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

const ROUTER_SYSTEM = `
You are Jarvis OS's **Mission Router**.

Analyze the latest human request and produce the optimal ordered set of agents to respond.

Return **only** a JSON array of agent ids, for example: ["todo", "web"].

Agent roster:
- "todo": Task Orchestrator — restructure and synchronize task lists.
- "web": Sentinel Analyst — fetch current market/news intel with sources.
- "notes": Knowledge Synthesizer — distill conversations into briefings.
- "finance": Market Navigator — explain market moves with risk framing.

Routing heuristics:
- Capture all distinct intents. If the user blends planning + market info, include both "todo" and the relevant intel agent.
- Prefer "web" when the user requests current data or verification; pair with "finance" when interpretation or education is needed.
- If the user is only clarifying or journaling, route to "notes".
- Default fallback: ["notes"].
- Avoid duplicates unless the user explicitly asks to revisit the same domain.
`.trim();

const ALL_AGENTS: AgentValue[] = ["todo", "web", "notes", "finance"];

function sanitizeAgentList(value: unknown): AgentValue[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const result: AgentValue[] = [];
  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }
    const match = ALL_AGENTS.find((agent) => agent === item);
    if (match) {
      result.push(match);
    }
  }
  return result;
}

function parsePlan(text: string): AgentValue[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = undefined;
  }

  if (Array.isArray(parsed)) {
    const ordered: AgentValue[] = [];
    for (const item of parsed) {
      if (typeof item !== "string") {
        continue;
      }
      const lower = item.trim().toLowerCase();
      const match = ALL_AGENTS.find((agent) => lower === agent);
      if (match && !ordered.includes(match)) {
        ordered.push(match);
      }
    }
    if (ordered.length > 0) {
      return ordered;
    }
  }

  const lowerText = text.toLowerCase();
  const inferred: AgentValue[] = [];
  for (const agent of ALL_AGENTS) {
    if (lowerText.includes(agent) && !inferred.includes(agent)) {
      inferred.push(agent);
    }
  }
  if (inferred.length > 0) {
    return inferred;
  }
  return ["notes"];
}

function getLastHumanMessage(
  messages: ReturnType<typeof normalizeMessages>
): { index: number; message: any } | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const candidate = messages[i];
    const type =
      typeof candidate?.getType === "function"
        ? candidate.getType()
        : (candidate as any)?.type ?? (candidate as any)?.role;
    if (type === "human" || type === "user") {
      return { index: i, message: candidate };
    }
  }
  return null;
}

export async function routerNode(
  state: AppStateType
): Promise<Partial<AppStateType>> {
  const messages = normalizeMessages(state.messages);
  const queue = sanitizeAgentList(state.pending_agents);

  if (queue.length > 0) {
    const [next, ...rest] = queue;
    return {
      selected_agent: next,
      pending_agents: rest,
    };
  }

  const lastHumanEntry = getLastHumanMessage(messages);

  if (!lastHumanEntry) {
    return {
      selected_agent: null,
    };
  }

  const { index: lastHumanIndex, message: lastHuman } = lastHumanEntry;
  const lastHumanText = contentToText((lastHuman as any)?.content).trim();
  const messageKey =
    (lastHuman as any)?.id ?? `${lastHumanIndex}:${lastHumanText}`;

  if (state.last_routed_message_id === messageKey) {
    return {
      selected_agent: null,
    };
  }

  const reply = await routerModel.invoke([
    new SystemMessage(ROUTER_SYSTEM),
    new HumanMessage(lastHumanText),
  ]);

  const plan = parsePlan(contentToText(reply.content));
  const effectivePlan: AgentValue[] = plan.length > 0 ? plan : ["notes"];
  const [next, ...rest] = effectivePlan;

  return {
    selected_agent: next,
    pending_agents: rest,
    last_routed_message_id: messageKey,
  };
}
