import "dotenv/config";
// import OpenAI from "openai";
import Groq from "groq-sdk";

// const client = new OpenAI({
//   apiKey: process.env.GROQ_API_KEY,
//   baseURL: "https://api.groq.com/openai/v1",
// });

// const response = await client.chat.completions.create({
//   model: "openai/gpt-oss-20b",
//   messages: [
//     { role: "user", content: "Explain the importance of fast language models" },
//   ],
// });

// console.log(response.choices[0].message.content);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const main = async () => {
  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "user",
        content: "can AI Take the job of a software engineer??",
      },
    ],
  });

  console.log(response?.choices[0]?.message?.content);
};

main();
