// src/agent-gemini.ts
import { HumanMessage } from "@langchain/core/messages";
import { graph } from "./graph";

async function main() {
  const userInput =
    process.argv.slice(2).join(" ") || "Add 12 and 7 and explain";

  const finalState = await graph.invoke({
    messages: [new HumanMessage(userInput)],
  });

  console.log(finalState.messages);
}

main().catch(console.error);
