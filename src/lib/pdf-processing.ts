import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OllamaEmbeddings, ChatOllama } from "@langchain/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from 'ai'

export const loadAndSplitTheDocs = async (file_path: string) => {
  if (typeof window !== 'undefined') {
    throw new Error('This function can only be run on the server side');
  }

  const loader = new PDFLoader(file_path);
  const docs = await loader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splits = await textSplitter.splitDocuments(docs);
  
  // Store the splits in ChromaDB
  const embeddings = new OllamaEmbeddings();
  await Chroma.fromDocuments(
    splits,
    embeddings,
    {
      collectionName: "pdf_documents",
      url: "http://localhost:8000",
    }
  );

  return splits;
};

export const vectorSearch = async (sessionId: string, question: string) => {
  const embeddings = new OllamaEmbeddings();
  
  // Get existing Chroma collection
  const vectorStore = await Chroma.fromExistingCollection(
    embeddings,
    {
      collectionName: "pdf_documents",
      url: "http://localhost:8000",
    }
  );

  const searches = await vectorStore.similaritySearch(question, 4);
  return searches;
};

export const generatePrompt = async (searches: any[], question: string) => {
  let context = "";
  searches.forEach((search) => {
    context = context + "\n\n" + search.pageContent;
  });

  const prompt = PromptTemplate.fromTemplate(`
    You are a helpful assistant. 
    Check your knowledge base before answering any questions.
    Only respond to questions using information from tool calls.
    if no relevant information is found in the tool calls, respond, "Sorry, I don't know."

    ${context}

    ---

    Answer the question based on the above context: ${question}
  `);

  const formattedPrompt = await prompt.format({
    context: context,
    question: question,
  });
  return formattedPrompt;
}

export const generateOutput = async (prompt: string) => {
  const ollamaLlm = new ChatOllama({
    baseUrl: "http://localhost:11434",
    model: "llama3.2",
  });

  const stream = await ollamaLlm.stream(prompt);
  return LangChainAdapter.toDataStreamResponse(stream);
}
