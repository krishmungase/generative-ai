import "dotenv/config";
import { Command } from "@langchain/langgraph";
import { createInterface } from "readline/promises";
import { graph } from "./graph.js";
import { HumanMessage } from "@langchain/core/messages";

const rl = createInterface({ input: process.stdin, output: process.stdout });

const main = async () => {
    const config = { configurable: { thread_id: "session-1" } };

    console.log("\n🤖 AI Assistant ready! (type 'exit' to quit)\n");

    while (true) {
        const userInput = await rl.question("You: ");
        if (userInput.toLowerCase() === "exit") {
            console.log("\nGoodbye! 👋\n");
            break;
        }

        await runWithInterrupts(
            { messages: [new HumanMessage(userInput)] },
            config
        );
    }

    rl.close();
};


async function runWithInterrupts(input, config) {
    let currentInput = input;

    while (true) {
        const result = await graph.invoke(currentInput, config);


        if (result.__interrupt__?.length) {
            const iv = result.__interrupt__[0].value;

            if (iv?.actionRequests) {
                for (const action of iv.actionRequests) {
                    console.log(`\n⚠️  Action requires approval`);
                    console.log(`   Tool : ${action.name}`);
                    console.log(`   Args : ${JSON.stringify(action.args, null, 2)}`);
                }

                const answer = await rl.question("\n   Approve? (yes/no): ");
                const approved = answer.trim().toLowerCase() === "yes";
                console.log(approved ? "   ✅ Approved\n" : "   ❌ Denied\n");

                const decisions = iv.actionRequests.map(() =>
                    approved
                        ? { type: "approve" }
                        : { type: "reject", message: "User rejected this action. Do not retry unless asked." }
                );

                currentInput = new Command({ resume: { decisions } });

            } else {

                const { label, toolName, args } = iv ?? {};
                const requestText = args?.request ?? args?.query ?? JSON.stringify(args ?? iv);

                console.log(`\n⚠️  ${label ?? "Action requires your approval"}`);
                console.log(`   Tool    : ${toolName}`);
                console.log(`   Request : ${requestText}`);

                const answer = await rl.question("\n   Approve? (yes/no): ");
                const approved = answer.trim().toLowerCase() === "yes";
                console.log(approved ? "   ✅ Approved\n" : "   ❌ Denied\n");


                currentInput = new Command({ resume: { approved } });
            }

            continue;
        }

        const lastMsg = result.messages?.at(-1);
        if (lastMsg?.content) {
            console.log("\nAssistant:", lastMsg.content, "\n");
        }
        break;
    }
}

main();
