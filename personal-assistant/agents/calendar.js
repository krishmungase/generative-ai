import { model } from "../model.js"
import { createAgent, humanInTheLoopMiddleware } from "langchain"
import { calendarSystemPrompt } from "./constant.js"
import { createCalendarEventTool, listCalendarEventTool, deleteCalendarEventTool } from "../tools/index.js"

export const calendarAgent = createAgent({
    model,
    tools: [createCalendarEventTool, listCalendarEventTool, deleteCalendarEventTool],
    systemPrompt: calendarSystemPrompt(),
    middleware: [
        humanInTheLoopMiddleware({
            interruptOn: { create_calendar_event: true },
            descriptionPrefix: "Calendar event pending approval",
        }),
    ],
})