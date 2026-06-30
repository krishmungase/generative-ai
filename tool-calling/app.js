import "dotenv/config";
import Groq from "groq-sdk";
import { tavily } from "@tavily/core";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const websearch = async ({ query }) => {
  // here tavily api calling code will be added
  console.log("calling tool....");
  const results = await tvly.search(query, {
    searchDepth: "basic",
    maxResults: 5,
  });
  return JSON.stringify(results);
};

const main = async () => {
  const messages = [
    {
      role: "system",
      content: `You are a personal assistant. You will help the user with their queries and provide useful information.
        you have access to a tool called "websearch" that allows you to search the web for information. You can use this tool to find answers to the user's questions.
        websearch(query: string) => string
        `,
    },
    {
      role: "user",
      content: "what is the weather in New York City today?",
    },
  ];

  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    temperature: 0.2,
    tools: [
      {
        type: "function",
        function: {
          name: "websearch",
          description: "Search the web for information",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query",
              },
            },
            required: ["query"],
          },
        },
      },
    ],
    messages,
  });

  const message = response?.choices[0]?.message;
  messages.push(message);

  if (!message?.tool_calls) {
    console.log(`Assistant: ${message?.content}`);
    return;
  }

  for (const tool of message.tool_calls) {
    const functionName = tool.function.name;
    const functionArgs = tool.function.arguments;

    if (functionName === "websearch") {
      const result = await websearch(JSON.parse(functionArgs));
      messages.push({
        role: "tool",
        tool_call_id: tool.id,
        content: result,
      });
    }
  }

  const finalResponse = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    temperature: 0.2,
    messages,
  });

  console.log(finalResponse.choices[0].message.content);
};

main();
