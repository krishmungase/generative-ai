import "dotenv/config";
import { createInterface } from "readline/promises";
import { supervisorAgent } from "./supervisor-agent.js";


const main = async () => {
    const rl = createInterface({ input: process.stdin, output: process.stdout })


    const config = { configurable: { thread_id: "session-1" } };

    console.log("\n🤖 AI Assistant ready! (type 'exit' to quit)\n");

    while (true) {
        const userInput = await rl.question("You: ")
        if (userInput.toLowerCase() === "exit") {
            console.log("\nGoodbye! 👋\n");
            break;
        }

        const response = await supervisorAgent.invoke(
            { messages: [{ role: "user", content: userInput }] },
            config
        )

        console.log("\nAssistant:", response.messages[response.messages.length - 1].content, "\n")
    }

    rl.close();
}


main();
