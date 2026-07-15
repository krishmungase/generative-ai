import "dotenv/config";
import { Command } from "@langchain/langgraph";
import { createInterface } from "readline/promises";
import { supervisorAgent } from "./supervisor-agent.js";
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

/**
 * Invokes the supervisor agent and loops to handle HITL interrupts.
 *
 * createAgent (from "langchain") returns result.__interrupt__ when a tool
 * inside the graph calls interrupt(). We present the pending action to the
 * user, collect their yes/no, then resume with Command({ resume: decision }).
 *
 * Manual interrupt() in a tool → resume with the raw value (true / false).
 * humanInTheLoopMiddleware interrupt → resume with { decisions: [...] }.
 */
async function runWithInterrupts(input, config) {
    let currentInput = input;

    while (true) {
        const result = await supervisorAgent.invoke(currentInput, config);

        // ── Interrupt detected ─────────────────────────────────────────────
        if (result.__interrupt__?.length) {
            const iv = result.__interrupt__[0].value;

            // humanInTheLoopMiddleware / interruptOn  →  { actionRequests, reviewConfigs }
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
                // Manual interrupt() in a sub-agent tool  →  { label, toolName, args }
                const { label, toolName, args } = iv ?? {};
                const requestText = args?.request ?? args?.query ?? JSON.stringify(args ?? iv);

                console.log(`\n⚠️  ${label ?? "Action requires your approval"}`);
                console.log(`   Tool    : ${toolName}`);
                console.log(`   Request : ${requestText}`);

                const answer = await rl.question("\n   Approve? (yes/no): ");
                const approved = answer.trim().toLowerCase() === "yes";
                console.log(approved ? "   ✅ Approved\n" : "   ❌ Denied\n");

                // Resume with an object — plain `false` is treated as empty by LangGraph
                currentInput = new Command({ resume: { approved } });
            }

            continue; // stream again after resume
        }

        // ── No interrupt — print final response ─────────────────────────────
        const lastMsg = result.messages?.at(-1);
        if (lastMsg?.content) {
            console.log("\nAssistant:", lastMsg.content, "\n");
        }
        break;
    }
}

main();
