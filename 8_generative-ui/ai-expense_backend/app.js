import { graph } from "./src/graph.js";
import { connectDB } from "./src/db/index.js";


const main = async () => {
    const config = { configurable: { thread_id: "session-3" } };

    try {
        await connectDB();
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection error", error);
    }

    const response = await graph.invoke({
        messages: [
            {
                role: 'user',
                content: "categories the expenses by category"
            }
        ]
    }, config);

    const lastMsg = response.messages?.at(-1);
    if (lastMsg?.content) {
        console.log("\nAssistant:", lastMsg.content, "\n");
    }
}

main();