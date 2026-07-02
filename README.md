# Vector Search API

[![MCP Server](https://img.shields.io/badge/MCP-server-blue)](https://vector-search.api.klymax402.com/mcp)
[![x402](https://img.shields.io/badge/payments-x402-6E56CF)](https://x402.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

In-memory vector store with TF-IDF vectorization and cosine similarity search. Pay-per-call via [x402](https://x402.org) (USDC on Base L2) -- no API key, no signup, no rate-limit wall.

Part of the [klymax402](https://klymax402.com) marketplace -- 100 x402 micropayment APIs for AI agents, one wallet, USDC on Base.

## Quickstart -- MCP

Add to your MCP client config (Claude Desktop, Cursor, ElizaOS, etc.):

```json
{
  "mcpServers": {
    "vector-search": {
      "url": "https://vector-search.api.klymax402.com/mcp"
    }
  }
}
```

## Quickstart -- HTTP (x402)

```bash
curl -X POST "https://vector-search.api.klymax402.com/api/search" \
  -H "Content-Type: application/json" \
  -d '{"query":"..."}'
# -> 402 Payment Required, with an x402 payment challenge in the response body
```

Any x402-aware client ([`@x402/fetch`](https://www.npmjs.com/package/@x402/fetch), [`x402-agent-tools`](https://www.npmjs.com/package/x402-agent-tools), ATXP) handles the 402 -> sign -> retry cycle automatically.

## Tools

| Tool | Method | Path | Price | Description |
|---|---|---|---|---|
| `data_vector_search` | POST | `/api/search` | $0.005 | Store text and search by semantic similarity |

### `data_vector_search`

Use this when you need to store text documents and search them by semantic similarity. Accepts documents to store and a query to search. Uses TF-IDF vectorization with cosine similarity to find the most relevant matches. Returns top-k results with similarity scores. Do NOT use for web search — use web_search_query instead. Do NOT use for keyword research — use keyword_research instead. Do NOT use for text classification — use text_classify instead.

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `documents` | array | no | Array of text documents to index (optional if already stored in this session) |
| `query` | string | yes | The text query to search for |
| `topK` | number | no | Number of top results to return (default: 3, max: 10) |
| `namespace` | string | no | Namespace to isolate document sets (default: 'default') |

## Example agent prompts

- "Store text documents and search them by semantic similarity"

## Payment

- Protocol: [x402](https://x402.org) -- HTTP-native pay-per-call, no signup, no API key
- Network: Base L2 (`eip155:8453`)
- Asset: USDC
- Facilitator: Coinbase CDP (primary), PayAI (fallback)

## Part of klymax402

100 x402 micropayment APIs for AI agents -- one wallet, USDC on Base, zero signup.

- Catalog: https://klymax402.com/llms.txt
- Full API reference: https://klymax402.com/llms-full.txt
- Live stats: https://klymax402.com/stats

## License

MIT
