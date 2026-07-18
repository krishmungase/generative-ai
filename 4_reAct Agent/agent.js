import "dotenv/config";
import { createInterface } from "readline/promises";

import { systemPrompt } from "./constant.js";
import { webSearch, createCalendarEventTool, listCalendarEventTool, deleteCalendarEventTool } from "./tools.js"

import { createAgent } from "langchain"
import { ChatGroq } from "@langchain/groq"
import { MemorySaver } from "@langchain/langgraph"


const main = async () => {
    const model = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: "openai/gpt-oss-20b",
        temperature: 0,
    });

    // MemorySaver stores the full conversation history in memory
    // Each unique thread_id = a separate independent conversation
    const checkpointer = new MemorySaver();

    const agent = createAgent({
        model,
        tools: [webSearch, createCalendarEventTool, listCalendarEventTool, deleteCalendarEventTool],
        systemPrompt,
        checkpointSaver: checkpointer,   // plug in memory
    })

    const rl = createInterface({ input: process.stdin, output: process.stdout })

    // thread_id groups messages into one conversation session
    const config = { configurable: { thread_id: "session-1" } };

    console.log("\n🤖 AI Assistant ready! (type 'exit' to quit)\n");

    while (true) {
        const userInput = await rl.question("You: ")
        if (userInput.toLowerCase() === "exit") {
            console.log("\nGoodbye! 👋\n");
            break;
        }

        // No need to manually track messages — checkpointer handles it via thread_id
        const response = await agent.invoke(
            { messages: [{ role: "user", content: userInput }] },
            config   // <-- this is what links the conversation together
        )

        console.log("\nAssistant:", response.messages[response.messages.length - 1].content, "\n")
    }

    rl.close();
}


main();
