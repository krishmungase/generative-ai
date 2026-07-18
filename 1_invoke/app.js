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
    temperature: 0.2,
    // top_p: 0.1,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a sentiment analysis assistant. Analyze the sentiment of the user's 
          text and classify it as Positive, Negative, or Neutral. Provide a short 
          explanation for your classification.
          output the result in the following JSON format:
          {
            "sentiment": "Positive|Negative|Neutral",
            "explanation": "Short explanation of the sentiment classification"
          }
          `,
      },
      {
        role: "user",
        content: "The service was quick, but the food was disappointing.",
      },
    ],
  });

  console.log(response?.choices[0]?.message?.content);
};

main();
