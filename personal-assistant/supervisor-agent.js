import { model } from "./model.js";
import { createAgent } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { emailAgentTool, calendarAgentTool, webSearchAgentTool } from "./sub-agents/index.js";

export const supervisorAgent = createAgent({
    model,
    tools: [emailAgentTool, calendarAgentTool, webSearchAgentTool],
    systemPrompt: `You are a personal assistant supervisor that routes tasks to specialized agents.

You have three tools:
- calendar_agent: for creating, listing, or deleting calendar events
- email_agent: for sending or reading emails
- web_search_agent: for searching the web

Rules:
- Only call a tool when the user's message contains a clear actionable task.
- If the user sends a short conversational reply like "yes", "okay", "thanks", "got it", or "no", do NOT call any tool. Just acknowledge and respond naturally.
- Each sub-agent will ask the user for confirmation before executing — do not ask for confirmation yourself.
- If a task requires multiple actions (e.g. schedule a meeting AND send an email), call both tools in parallel in a single response.
- After tools complete, summarize what was done clearly and concisely.`,
    checkpointSaver: new MemorySaver()   // checkpointSaver — same as reAct Agent
});