import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "vector-search",
  slug: "vector-search",
  description: "In-memory vector store with TF-IDF vectorization and cosine similarity search.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/search",
      price: "$0.005",
      description: "Store text and search by semantic similarity",
      toolName: "data_vector_search",
      toolDescription: "Use this when you need to store text documents and search them by semantic similarity. Accepts documents to store and a query to search. Uses TF-IDF vectorization with cosine similarity to find the most relevant matches. Returns top-k results with similarity scores. Do NOT use for web search — use web_search_query instead. Do NOT use for keyword research — use keyword_research instead. Do NOT use for text classification — use text_classify instead.",
      inputSchema: {
        type: "object",
        properties: {
          documents: {
            type: "array",
            items: { type: "string" },
            description: "Array of text documents to index (optional if already stored in this session)",
          },
          query: { type: "string", description: "The text query to search for" },
          topK: { type: "number", description: "Number of top results to return (default: 3, max: 10)" },
          namespace: { type: "string", description: "Namespace to isolate document sets (default: 'default')" },
        },
        required: ["query"],
      },
    },
  ],
};
