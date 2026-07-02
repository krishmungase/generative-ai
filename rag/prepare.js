import "dotenv/config";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

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
  console.log("Chunk count:", chunks.length);
  console.log("First chunk:", chunks[0]);

  return chunks;
};
