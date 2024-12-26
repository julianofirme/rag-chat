# RAG Chat

A modern web application that enables users to have interactive conversations about PDF documents using AI. Built with Next.js, TypeScript, and integrated with Ollama for AI capabilities.

## 🌟 Features

- PDF document processing and chunking
- Vector-based semantic search using ChromaDB
- Interactive Chat Interface
- AI-Powered Document Analysis
- Efficient document chunking with RecursiveCharacterTextSplitter
- Context-Aware Responses
- Real-time Processing

## 🚀 Getting Started

### Prerequisites

- Node.js
- Docker (for ChromaDB)
- [Ollama](https://ollama.com/) installed locally

### Installation

1. Clone the repository:
```bash
git clone https://github.com/julianofirme/rag-chat.git
cd rag-chat
```

2. Install dependencies:
```bash
npm install
```

3. Make sure Ollama is running locally on port 11434
```bash
ollama run llama3.2
```

4. Start ChromaDB using Docker:
```bash
docker-compose up -d
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## How It Works

1. **PDF Upload**: Users can upload PDF documents through the interface
2. **Document Processing**: The application splits the PDF into manageable chunks using LangChain's text splitter
3. **Vector Storage**: Document chunks are embedded and stored in ChromaDB for efficient retrieval
4. **Chat Interface**: Users can ask questions about the uploaded document
5. **AI Processing**: The application uses Ollama to generate context-aware responses based on the document content

## 🛠 Tech Stack

- **Frontend**: Next.js
- **UI Components**: Shadcn/ui
- **AI/ML**: 
  - Ollama for LLM capabilities
  - LangChain for document processing
  - ChromaDB for vector storage

## 🔧 Project Structure

- `/src/app/page.tsx` - Main chat interface
- `/src/app/api/chat/route.ts` - Chat API endpoint
- `/src/app/api/upload/route.ts` - PDF upload handling
- `/src/lib/pdf-processing.ts` - PDF processing utilities

## License

This project is licensed under the MIT License - see the LICENSE file for details.
