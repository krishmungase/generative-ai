import express from "express";
import { graph } from "./graph.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

app.post("/api/ask", async (req, res) => {
    const { question } = req.body;

    if (!question?.trim()) {
        return res.status(400).json({ error: "Question is required." });
    }

    try {
        console.log(`\n📥 Question: "${question}"`);
        const result = await graph.invoke({ question });
        console.log(`✅ Done — Topic: ${result.topic} | Level: ${result.level} | Status: ${result.status}`);

        res.json({
            topic: result.topic,
            level: result.level,
            answer: result.answer,
        });
    } catch (err) {
        console.error("❌ Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 Doubt Agent server running at http://localhost:${PORT}`);
});
