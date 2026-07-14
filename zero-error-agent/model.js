import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { Annotation } from "@langchain/langgraph";

export const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "openai/gpt-oss-20b",
    temperature: 0,
});

export const State = Annotation.Root({
    question:      Annotation({ default: () => "" }),
    topic:         Annotation({ default: () => "" }),
    level:         Annotation({ default: () => "" }),
    draftAnswer:   Annotation({ default: () => "" }),
    criticFeedback: Annotation({ default: () => "" }),
    retryCount:    Annotation({ default: () => 0 }),
    agentUsed:     Annotation({ default: () => "" }),
    status:        Annotation({ default: () => "" }),
    answer:        Annotation({ default: () => "" }),
});