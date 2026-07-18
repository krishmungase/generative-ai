import "dotenv/config";
import * as z from "zod";
import { ChatGroq } from "@langchain/groq";
import { StateSchema } from "@langchain/langgraph";

export const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "openai/gpt-oss-20b",
    temperature: 0,
});

export const State = new StateSchema({
    destination: z.string(),
    days: z.number(),
    budget: z.number(),
    places: z.array(z.string()).default([]),
    weather: z.string().default(""),
    combinedOutput: z.string().default(""),
    // budget check results
    budgetRealistic: z.boolean().default(true),
    budgetReason: z.string().default(""),
    suggestedBudget: z.number().default(0),
    categoryBreakdown: z.object({
        accommodation: z.number(),
        food: z.number(),
        transport: z.number(),
        activities: z.number(),
    }).default({ accommodation: 0, food: 0, transport: 0, activities: 0 }),
});
