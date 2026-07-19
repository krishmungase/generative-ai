import { graph } from "./src/graph.js";
import { connectDB } from "./src/db/index.js";

const main = async () => {
    const config = {
        streamMode: "updates",
        configurable: { thread_id: "session-3" }
    };

    try {
        await connectDB();
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection error", error);
        return;
    }

    const stream = await graph.stream(
        {
            messages: [
                {
                    role: "user",
                    content: "Show me all my expenses"
                }
            ]
        },
        config
    );

    let finalState = null;

    for await (const chunk of stream) {
        const [step, content] = Object.entries(chunk)[0];
        console.log(`step: ${step}`);
        console.log(`   content: ${JSON.stringify(content, null, 2)}\n`);
        finalState = content;
    }

    const lastMsg = finalState?.messages?.at(-1);
    if (lastMsg?.content) {
        console.log("\nAssistant:", lastMsg.content, "\n");
    }
};

main();