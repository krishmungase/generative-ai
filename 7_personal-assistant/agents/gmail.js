import { model } from "../model.js";
import { createAgent } from "langchain";
import { emailSystemPrompt } from "./constant.js";
import { sendEmail, readEmail } from "../tools/index.js";

export const emailAgent = createAgent({
    model,
    tools: [sendEmail, readEmail],
    systemPrompt: emailSystemPrompt(),
});