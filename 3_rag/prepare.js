import "dotenv/config";
import { PineconeStore } from "@langchain/pinecone";
import { Document } from "@langchain/core/documents";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
});

const pinecone = new PineconeClient({
  apiKey: process.env.PINECONE_API_KEY,
});
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex,
  maxConcurrency: 5,
});

export const loadTheDocumentChunks = async (filePath) => {
  const loader = new PDFLoader(filePath, { splitPages: false });
  const docs = await loader.load();
  console.log("Loaded documents:", docs.length);

  const document = docs[0]?.pageContent || "";
  console.log("Document length:", document.length);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 400,
    chunkOverlap: 100,
  });

  const chunks = await splitter.splitText(document);
  const documents = chunks.map(
    (chunk) =>
      new Document({
        pageContent: chunk,
        metadata: docs[0]?.metadata || {},
      })
  );
  console.log("Chunks:", chunks.length);
  console.log("Documents:", documents.length);

  if (documents.length === 0) {
    console.error("No documents to upsert. Check your PDF or chunking config.");
    return;
  }

  await vectorStore.addDocuments(documents);
  console.log("✅ Successfully upserted", documents.length, "documents to Pinecone.");
};
