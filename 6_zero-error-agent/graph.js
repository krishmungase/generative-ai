import { StateGraph, START, END } from "@langchain/langgraph";
import { State } from "./model.js";
import {
    supervisor,
    jsAgent,
    dsaAgent,
    sysDesignAgent,
    generalAgent,
    criticAgent,
} from "./nodes.js";

const routeToAgent = (state) => state.topic;

const checkQuality = (state) => {
    if (state.status === "pass") return "pass";
    return `retry_${state.agentUsed}`;
};

const workflow = new StateGraph(State)
    .addNode("supervisor", supervisor)
    .addNode("jsAgent", jsAgent)
    .addNode("dsaAgent", dsaAgent)
    .addNode("sysDesignAgent", sysDesignAgent)
    .addNode("generalAgent", generalAgent)
    .addNode("criticAgent", criticAgent)

    .addEdge(START, "supervisor")

    .addConditionalEdges("supervisor", routeToAgent, {
        javascript: "jsAgent",
        dsa: "dsaAgent",
        sysdesign: "sysDesignAgent",
        general: "generalAgent",
    })

    .addEdge("jsAgent", "criticAgent")
    .addEdge("dsaAgent", "criticAgent")
    .addEdge("sysDesignAgent", "criticAgent")
    .addEdge("generalAgent", "criticAgent")

    .addConditionalEdges("criticAgent", checkQuality, {
        pass: END,
        retry_jsAgent: "jsAgent",
        retry_dsaAgent: "dsaAgent",
        retry_sysDesignAgent: "sysDesignAgent",
        retry_generalAgent: "generalAgent",
    })


export const graph = workflow.compile();