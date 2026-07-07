import "dotenv/config";
import * as z from "zod";
import { ChatGroq } from "@langchain/groq";
import { StateGraph, StateSchema } from "@langchain/langgraph";
import { createInterface } from "readline/promises";

const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "openai/gpt-oss-20b",
    temperature: 0,
});

const State = new StateSchema({
    destination: z.string(),
    days: z.number(),
    places: z.array(z.string()).default([]),
    weather: z.string().default(""),
    combinedOutput: z.string().default(""),
});

const cleanJson = (text) => text.replace(/```json|```/g, "").trim();

const findPlaces = async (state) => {
    console.log("Finding places...");
    const numPlaces = Math.min(Math.max(state.days * 2, 4), 15);

    const prompt = `You are a travel assistant that recommends real, well-known tourist places for a given destination. Return ONLY valid JSON, with no markdown formatting, code fences, or extra text.
    Schema:
    {
    "places": string[]
    }`

    const aiMsg = await model.invoke([
        {
            role: "system",
            content: prompt,
        },
        {
            role: "user",
            content: `Destination: ${state.destination} Trip duration: ${state.days} day(s) Suggest exactly ${numPlaces} real, distinct places to visit in ${state.destination}, suitable for a ${state.days}-day trip.`,
        },
    ]);

    try {
        const result = JSON.parse(cleanJson(aiMsg.content));
        return {
            places: Array.isArray(result.places) ? result.places : [],
        };
    } catch (err) {
        console.error("findPlaces JSON parse error:", err.message, "\nRaw:", aiMsg.content);
        return { places: [] };
    }
};

const fetchWeather = async (destination) => {
    try {
        const url = `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_KEY}&q=${encodeURIComponent(destination)}`;
        const res = await fetch(url);
        const data = res.ok ? await res.json() : null;
        return data?.current ? { temp: data.current.temp_c, desc: data.current.condition?.text } : null;
    } catch (err) {
        console.error("Weather fetch error:", err.message);
        return null;
    }
};

const weatherNode = async (state) => {
    console.log("Getting weather...");
    const weather = await fetchWeather(state.destination);

    if (!weather || weather.temp === undefined) {
        return { weather: "Weather data unavailable." };
    }

    const now = new Date();
    const prompt = `You are a weather assistant.
    current weather: ${weather.desc}, ${weather.temp}°C
    Current Date: ${now.toDateString()}
    Current Time: ${now.toLocaleTimeString("en-IN")}
    Time Zone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
    Destination: ${state.destination}

    Return ONLY one concise weather sentence, no extra text.
    Example: "Sunny, 30°C with light breeze."`;

    const aiMsg = await model.invoke([
        {
            role: "system",
            content: prompt,
        },
    ]);

    return {
        weather: aiMsg.content?.trim() ?? "Weather unavailable.",
    };
};

const aggregator = async (state) => {
    console.log("Generating itinerary...");

    const prompt = `
    You are a travel planner.Create a concise ${state.days} -day itinerary.
        Destination: ${state.destination}
    Weather: ${state.weather}
    Places to include: ${state.places.length ? state.places.join(", ") : "no specific places found; use your own knowledge"}
    Format as a short day - by - day plan.
    `

    const aiMsg = await model.invoke([
        {
            role: "system",
            content: prompt,
        },
    ]);

    return {
        combinedOutput: aiMsg.content,
    };
};

const workflow = new StateGraph(State)
    .addNode("findPlaces", findPlaces)
    .addNode("weatherNode", weatherNode)
    .addNode("aggregator", aggregator)
    .addEdge("__start__", "findPlaces")
    .addEdge("__start__", "weatherNode")
    .addEdge("findPlaces", "aggregator")
    .addEdge("weatherNode", "aggregator")
    .addEdge("aggregator", "__end__");

const graph = workflow.compile();

async function main() {
    const rl = createInterface({ input: process.stdin, output: process.stdout });

    console.log("\n🤖 Travel Itinerary Planner ready! (type 'exit' to quit)\n");

    while (true) {
        const destination = await rl.question("Destination: ");
        if (destination.toLowerCase() === "exit") {
            console.log("\nGoodbye! 👋\n");
            break;
        }

        const daysInput = await rl.question("Number of days: ");
        if (daysInput.toLowerCase() === "exit") {
            console.log("\nGoodbye! 👋\n");
            break;
        }

        const days = parseInt(daysInput, 10);
        if (isNaN(days) || days <= 0) {
            console.log("Please enter a valid positive number of days.\n");
            continue;
        }

        try {
            const result = await graph.invoke({
                destination,
                days,
            });

            console.log("\n==============================");
            console.log(result.combinedOutput);
            console.log("==============================\n");
        } catch (error) {
            console.error("Error executing workflow:", error);
        }
    }

    rl.close();
}

main();