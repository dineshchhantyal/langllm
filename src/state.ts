// src/state.ts
import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

export const AppState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  goal: Annotation<string | null>({
    reducer: (previous, update) =>
      typeof update === "undefined" ? previous : update,
    default: () => null,
  }),
  selected_agent: Annotation<"todo" | "web" | "notes" | "finance" | null>({
    reducer: (previous, update) =>
      typeof update === "undefined" ? previous : update,
    default: () => null,
  }),
});

export type AppStateType = typeof AppState.State;
