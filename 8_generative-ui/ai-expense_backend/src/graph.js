import { ToolNode } from "@langchain/langgraph/prebuilt";
import { addExpense, getExpense, callModel, generateExpenseChart } from "./nodes/index.js";
import { END, MemorySaver, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";

const rawToolNode = new ToolNode([addExpense, getExpense, generateExpenseChart]);

// Sanitize null args → {} before Zod validation.
// Groq's Llama model sometimes generates `"arguments": "null"` for tools
// with no required params (e.g. "Show all expenses"), which causes Zod to throw
// "expected object, received null".
const safeToolNode = async (state) => {
    const messages = state.messages.map((msg) => {
        if (msg.tool_calls?.length > 0) {
            const patchedToolCalls = msg.tool_calls.map((tc) => ({
                ...tc,
                args: tc.args ?? {},
            }));
            return msg.constructor
                ? Object.assign(Object.create(Object.getPrototypeOf(msg)), msg, { tool_calls: patchedToolCalls })
                : { ...msg, tool_calls: patchedToolCalls };
        }
        return msg;
    });
    return rawToolNode.invoke({ ...state, messages });
};

const isToolCalled = (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    return lastMessage?.tool_calls?.length > 0 ? "toolNode" : "END";
};

const graph = new StateGraph(MessagesAnnotation)
    .addNode("callModel", callModel)
    .addNode("toolNode", safeToolNode)
    .addEdge(START, "callModel")
    .addConditionalEdges("callModel", isToolCalled, {
        END: END,
        toolNode: "toolNode"
    })
    .addEdge("toolNode", "callModel")
    .compile({
        checkpointer: new MemorySaver()
    })

export { graph };