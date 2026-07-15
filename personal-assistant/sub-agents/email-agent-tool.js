import { z } from "zod";
import { tool } from "langchain";
import { interrupt } from "@langchain/langgraph";
import { emailAgent } from "../agents/index.js";

export const emailAgentTool = tool(
    async ({ request }) => {
        const decision = interrupt({
            label: "📧 Email action",
            toolName: "email_agent",
            args: { request },
        });

        if (!decision?.approved) return "❌ Email action cancelled by user.";

        const result = await emailAgent.invoke({
            messages: [{ role: "user", content: request }]
        });

        return result.messages.at(-1)?.content ?? "Done.";
    },
    {
        name: "email_agent",
        description: `
Send emails using natural language.

Use this when the user wants to send notifications, reminders, or any email communication.
Handles recipient extraction, subject generation, and email composition.

Input: Natural language email request (e.g., 'send them a reminder about the meeting')
    `.trim(),
        schema: z.object({
            request: z.string().describe("Natural language email request"),
        }),
    }
);