import { model } from "./model.js";
import { MemorySaver } from "@langchain/langgraph";
import { AIMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { emailAgentTool, calendarAgentTool, webSearchAgentTool } from "./sub-agents/index.js";

const supervisorTools = [emailAgentTool, calendarAgentTool, webSearchAgentTool];

const toolNode = new ToolNode(supervisorTools);

const modelWithTools = model.bindTools(supervisorTools);

async function agentNode(state) {
    const systemMessage = {
        role: "system",
        content: `You are a personal assistant supervisor that routes tasks to specialized agents.

You have three tools:
- email_agent: for sending or reading emails
- calendar_agent: for creating, listing, or deleting calendar events  
- web_search_agent: for searching the web

Rules:
- CRITICAL: Never call more than ONE tool at a time in a single turn. You are strictly forbidden from parallel tool calling.
- If the user's request requires multiple tools (e.g., "schedule a meeting AND email the details"):
  1. Only call the first tool (e.g., calendar_agent) in this turn.
  2. Wait for the tool to execute and return its result.
  3. In the next turn, read the result (e.g., the generated meeting link), and call the second tool (e.g., email_agent) passing the actual details/link from the first tool's output.
- Only call a tool when the user's message contains a clear actionable task.
- If the user sends a short conversational reply like "yes", "okay", "thanks", do NOT call any tool. Just acknowledge naturally.
- Each sub-agent will ask the user for confirmation before executing — do not ask for confirmation yourself.
- After all steps are complete, summarize what was done clearly and concisely.`,
    };

    const response = await modelWithTools.invoke([
        systemMessage,
        ...state.messages,
    ]);

    return { messages: [response] };
}

function shouldContinue(state) {
    const lastMessage = state.messages[state.messages.length - 1];

    if (lastMessage instanceof AIMessage && lastMessage.tool_calls?.length > 0) {
        return "tools";
    }

    return END;
}


const graph = new StateGraph(MessagesAnnotation)
    .addNode("agent", agentNode)
    .addNode("tools", toolNode)
    .addEdge(START, "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent")
    .compile({
        checkpointer: new MemorySaver(),
    });

export { graph };
