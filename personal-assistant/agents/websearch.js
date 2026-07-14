import { model } from "../model.js"
import { createAgent } from "langchain"
import { webSearch } from "../tools/index.js"
import { webSearchSystemPrompt } from "./constant.js"

export const webSearchAgent = createAgent({
    model,
    tools: [webSearch],
    systemPrompt: webSearchSystemPrompt,
});