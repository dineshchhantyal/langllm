// src/graph_moe.ts
import "dotenv/config";
import { StateGraph, START, END } from "@langchain/langgraph";
import { AppState, AppStateType } from "./state";
import { routerNode } from "./nodes/router";
import { todoAgentNode } from "./nodes/todoAgent";
import { webAgentNode } from "./nodes/webAgent";
import { notesAgentNode } from "./nodes/notesAgent";
import { financeAgentNode } from "./nodes/financeAgent";

function routeFromRouter(state: AppStateType) {
  const agent = state.selected_agent;
  if (agent === "todo") return "todo_agent";
  if (agent === "web") return "web_agent";
  if (agent === "notes") return "notes_agent";
  if (agent === "finance") return "finance_agent";
  return END;
}

export const moeGraph = new StateGraph(AppState)
  .addNode("router", routerNode)
  .addNode("todo_agent", todoAgentNode)
  .addNode("web_agent", webAgentNode)
  .addNode("notes_agent", notesAgentNode)
  .addNode("finance_agent", financeAgentNode)
  .addEdge(START, "router")
  .addConditionalEdges("router", routeFromRouter, [
    "todo_agent",
    "web_agent",
    "notes_agent",
    "finance_agent",
    END,
  ])
  .addEdge("todo_agent", "router")
  .addEdge("web_agent", "router")
  .addEdge("notes_agent", "router")
  .addEdge("finance_agent", "router")
  .compile({
    name: "bun-gemini-moe-agent",
  });
