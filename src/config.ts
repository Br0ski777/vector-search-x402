import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "vector-search",
  slug: "vector-search",
  description: "In-memory vector store with TF-IDF and cosine similarity search. Store docs, query by meaning.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/search",
      price: "$0.005",
      description: "Store text and search by semantic similarity",
      toolName: "data_vector_search",
      toolDescription: `Use this when you need to store text documents and search them by semantic similarity. Uses TF-IDF vectorization with cosine similarity to find the most relevant matches from your document set.

1. results: array of top-k matching documents with similarity scores
2. Each result contains: text (matched document), score (0-1 cosine similarity), index (document position)
3. query: the search query used
4. totalDocuments: number of documents in the namespace
5. namespace: the namespace searched

Example output: {"results":[{"text":"Machine learning enables predictive analytics...","score":0.87,"index":3},{"text":"Deep learning models require large datasets...","score":0.72,"index":7}],"query":"AI prediction models","totalDocuments":25,"namespace":"default"}

Use this FOR building knowledge bases, FAQ matching, document retrieval, or finding similar content. Essential when you need meaning-based search rather than keyword matching.

Do NOT use for web search -- use web_search_query. Do NOT use for text classification -- use text_classify_content. Do NOT use for summarization -- use ai_summarize_text.`,
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
