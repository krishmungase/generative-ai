import "dotenv/config";
import { graph } from "./graph.js";

const destination = "Paris";
const days = 3;
const budget = 50000; // ₹

const result = await graph.invoke({ destination, days, budget });

console.log("\n==============================");
console.log(result.combinedOutput);
console.log("==============================");
console.log("\n💰 Budget Check:");
console.log(`  Realistic: ${result.budgetRealistic ? "✅ Yes" : "❌ No"}`);
console.log(`  Reason: ${result.budgetReason}`);
console.log(`  Suggested Budget: ₹${result.suggestedBudget}`);
console.log(`  Breakdown:`);
const b = result.categoryBreakdown;
console.log(`    🏨 Accommodation: ₹${b.accommodation}`);
console.log(`    🍽️  Food:          ₹${b.food}`);
console.log(`    🚗 Transport:     ₹${b.transport}`);
console.log(`    🎭 Activities:    ₹${b.activities}`);
console.log("==============================\n");
