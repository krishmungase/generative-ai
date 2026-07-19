import { ToolNode } from "@langchain/langgraph/prebuilt";
import { addExpense, getExpense, callModel, generateExpenseChart } from "./nodes/index.js";
import { END, MemorySaver, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";

const toolNode = new ToolNode([addExpense, getExpense, generateExpenseChart]);


const isToolCalled = (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    return lastMessage?.tool_calls?.length > 0 ? "toolNode" : "END";
}

const shouldCallModel = (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    const message = JSON.parse(lastMessage.content);

    return message.type == 'chart' ? "END" : "callModel"
}

const graph = new StateGraph(MessagesAnnotation)
    .addNode("callModel", callModel)
    .addNode("toolNode", toolNode)
    .addEdge(START, "callModel")
    .addConditionalEdges("callModel", isToolCalled, {
        END: END,
        toolNode: "toolNode"
    })
    .addConditionalEdges("toolNode", shouldCallModel, {
        END: END,
        callModel: "callModel"
    })
    .compile({
        checkpointer: new MemorySaver()
    })

export { graph };