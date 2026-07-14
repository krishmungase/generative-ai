import { graph } from "./graph.js";

const question = "How do I detect a cycle in a linked list?";

const result = await graph.invoke({ question });

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`📚 Topic: ${result.topic} | Level: ${result.level}`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
console.log(result.answer);
console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
