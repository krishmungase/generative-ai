import { ENV } from '../config/index.js'
import { ChatGroq } from "@langchain/groq";

export const aiModel = new ChatGroq({
    apiKey: ENV.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0,
});
