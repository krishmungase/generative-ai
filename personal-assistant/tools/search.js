import * as z from "zod";
import { tool } from "langchain";
import { TavilySearch } from "@langchain/tavily";
import "dotenv/config";

const tavilySearchTool = new TavilySearch({
    tavilyApiKey: process.env.TAVILY_API_KEY,
    maxResults: 5,
    topic: "general",
});

// ─── Web Search ───────────────────────────────────────────────────────────────

export const webSearch = tool(
    ({ query }) => tavilySearchTool.invoke({ query }),
    {
        name: "websearch",
        description: "Search the web for up-to-date information.",
        schema: z.object({
            query: z.string().describe("Search terms to look for"),
        }),
    }
);
