import { ENV } from "../config/index.js";
import { ChatGroq } from "@langchain/groq";

export const aiModel = new ChatGroq({
  apiKey: ENV.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0,
});
