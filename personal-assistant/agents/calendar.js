import { model } from "../model.js";
import { createAgent } from "langchain";
import { calendarSystemPrompt } from "./constant.js";
import { createCalendarEventTool, listCalendarEventTool, deleteCalendarEventTool } from "../tools/index.js";

export const calendarAgent = createAgent({
    model,
    tools: [createCalendarEventTool, listCalendarEventTool, deleteCalendarEventTool],
    systemPrompt: calendarSystemPrompt(),
});