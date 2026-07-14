import { model } from "../model.js"
import { emailSystemPrompt } from "./constant.js"
import { sendEmail, readEmail } from "../tools/index.js"
import { createAgent, humanInTheLoopMiddleware } from "langchain"

export const emailAgent = createAgent({
    model,
    tools: [sendEmail, readEmail],
    systemPrompt: emailSystemPrompt(),
    middleware: [
        humanInTheLoopMiddleware({
            interruptOn: { send_email: true },
            descriptionPrefix: "Outbound email pending approval",
        }),
    ],
});