import { model } from "./model.js";

const cleanJson = (text) => text.replace(/```json|```/g, "").trim();

export const findPlaces = async (state) => {
    console.log("Finding places...");
    const numPlaces = Math.min(Math.max(state.days * 2, 4), 15);

    const prompt = `You are a travel assistant that recommends real, well-known tourist places for a given destination. Return ONLY valid JSON, with no markdown formatting, code fences, or extra text.
    Schema: { "places": string[] }`;

    const aiMsg = await model.invoke([
        { role: "system", content: prompt },
        { role: "user", content: `Destination: ${state.destination} Trip duration: ${state.days} day(s) Suggest exactly ${numPlaces} real, distinct places to visit in ${state.destination}, suitable for a ${state.days}-day trip.` },
    ]);

    try {
        const result = JSON.parse(cleanJson(aiMsg.content));
        return { places: Array.isArray(result.places) ? result.places : [] };
    } catch (err) {
        console.error("findPlaces JSON parse error:", err.message, "\nRaw:", aiMsg.content);
        return { places: [] };
    }
};

export const checkBudget = async (state) => {
    console.log("Budget checking...");
    const prompt = `You are a budget-checking assistant that helps travelers determine if their budget is realistic for the destination and duration.
    
    destination: ${state.destination}
    days: ${state.days}
    budget: ₹${state.budget}
    
    Evaluate if this budget is realistic for a ${state.days}-day trip to ${state.destination}.
    Consider local costs for accommodation, food, local transport, and activities/sightseeing.
    
    If the budget is unrealistic, suggest a more realistic total budget in ₹ for the same trip.
    
    Return ONLY valid JSON with this exact schema, and no other text:
    {
        "realistic": true/false,
        "reason": "short explanation",
        "suggestedBudget": <number, total ₹ you'd recommend for this trip>,
        "categoryBreakdown": {
            "accommodation": <number, ₹ for the whole trip>,
            "food": <number, ₹ for the whole trip>,
            "transport": <number, ₹ for the whole trip>,
            "activities": <number, ₹ for the whole trip>
        }
    }`;

    const aiMsg = await model.invoke([
        { role: "system", content: prompt },
        { role: "user", content: `Destination: ${state.destination} Trip duration: ${state.days} day(s) Budget: ₹${state.budget} Please evaluate the budget realism and return the JSON.` },
    ]);

    try {
        const result = JSON.parse(cleanJson(aiMsg.content));
        return {
            budgetRealistic: result.realistic ?? true,
            budgetReason: result.reason ?? "",
            suggestedBudget: result.suggestedBudget ?? state.budget,
            categoryBreakdown: result.categoryBreakdown ?? { accommodation: 0, food: 0, transport: 0, activities: 0 },
        };
    } catch (err) {
        console.error("checkBudget JSON parse error:", err.message, "\nRaw:", aiMsg.content);
        return {
            budgetRealistic: false,
            budgetReason: "Budget evaluation failed due to parsing error.",
            suggestedBudget: state.budget,
            categoryBreakdown: { accommodation: 0, food: 0, transport: 0, activities: 0 },
        };
    }
}

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

export const weatherNode = async (state) => {
    console.log("Getting weather...");
    const weather = await fetchWeather(state.destination);

    if (!weather?.temp) return { weather: "Weather data unavailable." };

    const now = new Date();
    const prompt = `You are a weather assistant.
    Current weather: ${weather.desc}, ${weather.temp}°C
    Date: ${now.toDateString()} | Time: ${now.toLocaleTimeString("en-IN")} | TZ: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
    Destination: ${state.destination}
    Return ONLY one concise weather sentence. Example: "Sunny, 30°C with light breeze."`;

    const aiMsg = await model.invoke([{ role: "system", content: prompt }]);
    return { weather: aiMsg.content?.trim() ?? "Weather unavailable." };
};

export const aggregator = async (state) => {
    console.log("Generating itinerary...");

    const prompt = `You are a travel planner. Create a concise ${state.days}-day itinerary.
    Destination: ${state.destination}
    Weather: ${state.weather}
    Places: ${state.places.length ? state.places.join(", ") : "no specific places; use your own knowledge"}
    Format as a short day-by-day plan.`;

    const aiMsg = await model.invoke([{ role: "system", content: prompt }]);
    return { combinedOutput: aiMsg.content };
};
