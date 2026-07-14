import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { interrupt } from "@langchain/langgraph";
import { calendarAgent } from "../agents/index.js"

export const calendarAgentTool = tool(
    async ({ request }) => {
        // Pause graph execution — app.js will prompt the user and resume with true/false
        const approved = interrupt({
            toolName: "calendar_agent",
            label: "📅 Calendar action",
            args: { request },
        });

        if (!approved) return "❌ Calendar action cancelled by user.";

        const result = await calendarAgent.invoke({
            messages: [{ role: "user", content: request }]
        });
        return result.messages.at(-1)?.content ?? "Done.";
    },
    {
        name: "calendar_agent",
        description: `
Schedule calendar events using natural language.

Use this when the user wants to create, modify, or check calendar appointments.
Handles date/time parsing, availability checking, and event creation.

Input: Natural language scheduling request (e.g., 'meeting with design team next Tuesday at 2pm')
    `.trim(),
        schema: z.object({
            request: z.string().describe("Natural language scheduling request"),
        }),
    }
);