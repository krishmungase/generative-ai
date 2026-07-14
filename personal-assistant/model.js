import "dotenv/config";
import { ChatGroq } from "@langchain/groq";

export const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "openai/gpt-oss-20b",
    temperature: 0,
});