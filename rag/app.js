import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { loadTheDocumentChunks } from "./prepare.js";

const filePath = "./sample.pdf";
const chunks = await loadTheDocumentChunks(filePath);

if (!chunks.length) {
  throw new Error("No chunks were generated from the PDF.");
}

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const response = await genAI.models.embedContent({
  model: "gemini-embedding-001",
  contents: chunks,
});

const embeddings = response.embeddings ?? [];

if (!embeddings.length) {
  throw new Error("No embeddings were returned from Gemini.");
}

const pinecone = new PineconeClient({
  apiKey: process.env.PINECONE_API_KEY,
});
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

const records = embeddings.map((embedding, index) => ({
  id: `doc-${index + 1}`,
  values: embedding.values,
  metadata: { text: chunks[index] },
}));

try {
  await pineconeIndex.upsertRecords({
    namespace: process.env.PINECONE_NAMESPACE || "default",
    records,
  });

  console.log("Pinecone vector store initialized successfully.");
  console.log(`Stored ${records.length} documents.`);
} catch (error) {
  if (error?.message?.includes("Integrated inference is not configured")) {
    console.error(
      "Pinecone index is missing integrated inference support for record upserts.",
    );
    console.error(
      "Create a Pinecone index that supports metadata + vectors, or enable the required inference setting in Pinecone.",
    );
  }
  throw error;
}
