// src/run_moe.ts
import "dotenv/config";
import { HumanMessage } from "@langchain/core/messages";
import { moeGraph } from "./graph_moe";

async function main() {
  const userInput =
    process.argv.slice(2).join(" ") ||
    "Please create todos for my study plan and explain index fund risk.";

  const finalState = await moeGraph.invoke({
    messages: [new HumanMessage(userInput)],
    goal: "Assist across todos, notes, web research, and finance.",
  });

  console.log("Messages:");
  for (const msg of finalState.messages) {
    const role = (msg as any).role ?? (msg as any).type ?? "unknown";
    console.log(role, ":", (msg as any).content);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
