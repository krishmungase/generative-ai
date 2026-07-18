import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { webSearchAgent } from "../agents/index.js"


export const webSearchAgentTool = tool(
    async ({ query }) => {
        const result = await webSearchAgent.invoke({
            messages: [
                {
                    role: "user",
                    content: query,
                },
            ],
        });

        return result.messages.at(-1)?.content ?? "No response.";
    },
    {
        name: "web_search_agent",
        description:
            "Searches the web for current information, news, facts, documentation, or recent events.",
        schema: z.object({
            query: z.string().describe("The search query"),
        }),
    }
);