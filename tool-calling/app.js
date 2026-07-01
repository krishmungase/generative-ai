import "dotenv/config";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
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

const tools = [
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
];

// Run one turn: keep calling the model until it stops asking for tools.
const runTurn = async (messages) => {
  while (true) {
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      temperature: 0.2,
      tools,
      messages,
    });

    const message = response?.choices[0]?.message;
    messages.push(message);

    // No tool calls -> this is the final answer.
    if (!message?.tool_calls) {
      return message?.content;
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
  }
};

const main = async () => {
  const rl = readline.createInterface({ input, output });

  const messages = [
    {
      role: "system",
      content: `You are a personal assistant. You will help the user with their queries and provide useful information.
        you have access to a tool called "websearch" that allows you to search the web for information. You can use this tool to find answers to the user's questions.
        websearch(query: string) => string
        `,
    },
  ];

  console.log('Assistant ready. Type your question (type "exit" or "bye" to quit).');

  while (true) {
    const question = (await rl.question("You: ")).trim();

    if (!question) continue;
    if (["exit", "bye", "quit"].includes(question.toLowerCase())) {
      console.log("Assistant: Goodbye!");
      break;
    }

    messages.push({ role: "user", content: question });

    const answer = await runTurn(messages);
    console.log(`Assistant: ${answer}\n`);
  }

  rl.close();
};

main();
