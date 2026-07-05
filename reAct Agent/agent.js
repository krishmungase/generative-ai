import "dotenv/config";

import { webSearch, createCalendarEventTool, listCalendarEventTool, deleteCalendarEventTool } from "./tools.js"

import { createAgent } from "langchain"
import { ChatGroq } from "@langchain/groq"


const systemPrompt = `
You are a helpful assistant.

If the user asks about:
- current weather
- latest news
- live sports
- stock prices
- recent events

always use the websearch tool instead of answering from memory.

If the user wants to:
- create a calendar event
- schedule a meeting
- add a reminder to their calendar
- update, reschedule, or delete a calendar event
- check their calendar availability or upcoming events

always use the Google Calendar tools like createCalendarEventTool, listCalendarEventTool, deleteCalendarEventTool . Do not create, modify, or infer calendar events from memory.

If the answer does not require current information or external tools, answer directly.

Time zone: Asia/Kolkata (Indian Standard Time, IST, UTC+05:30)
`;

const main = async () => {
    const model = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: "openai/gpt-oss-20b",
        temperature: 0,
    });

    const agent = createAgent({
        model,
        tools: [webSearch, createCalendarEventTool, listCalendarEventTool, deleteCalendarEventTool],
        systemPrompt
    })

    const response = await agent.invoke({
        messages: [
            {
                role: "user",
                content: "Schedule a meeting tomorrow at 3 PM. for 1 hour with title Meeting about AI development"
            },
        ]
    })
    console.log(response.messages[response.messages.length - 1].content);
}


main();
