import { StateGraph } from "@langchain/langgraph";
import { State } from "./model.js";
import { findPlaces, weatherNode, aggregator, checkBudget } from "./nodes.js";

const workflow = new StateGraph(State)
    .addNode("findPlaces", findPlaces)
    .addNode("weatherNode", weatherNode)
    .addNode("aggregator", aggregator)
    .addNode('checkBudget', checkBudget)
    .addEdge("__start__", "findPlaces")
    .addEdge("__start__", "weatherNode")
    .addEdge("__start__", "checkBudget")
    .addEdge("findPlaces", "aggregator")
    .addEdge("weatherNode", "aggregator")
    .addEdge("checkBudget", "aggregator")
    .addEdge("aggregator", "__end__");

export const graph = workflow.compile();