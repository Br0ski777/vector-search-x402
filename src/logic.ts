import type { Hono } from "hono";


// ATXP: requirePayment only fires inside an ATXP context (set by atxpHono middleware).
// For raw x402 requests, the existing @x402/hono middleware handles the gate.
// If neither protocol is active (ATXP_CONNECTION unset), tryRequirePayment is a no-op.
async function tryRequirePayment(price: number): Promise<void> {
  if (!process.env.ATXP_CONNECTION) return;
  try {
    const { requirePayment } = await import("@atxp/server");
    const BigNumber = (await import("bignumber.js")).default;
    await requirePayment({ price: BigNumber(price) });
  } catch (e: any) {
    if (e?.code === -30402) throw e;
  }
}

interface StoredDocument {
  text: string;
  vector: number[];
}

// In-memory store per namespace
const store: Map<string, StoredDocument[]> = new Map();

// Global vocabulary for TF-IDF
const globalVocab: Map<string, number> = new Map();
let vocabIndex = 0;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function buildVector(tokens: string[]): number[] {
  // Build TF vector using global vocabulary
  const tf: Map<string, number> = new Map();
  for (const token of tokens) {
    if (!globalVocab.has(token)) {
      globalVocab.set(token, vocabIndex++);
    }
    tf.set(token, (tf.get(token) || 0) + 1);
  }

  // Create sparse vector as dense array
  const vector = new Array(globalVocab.size).fill(0);
  for (const [token, count] of tf) {
    const idx = globalVocab.get(token)!;
    vector[idx] = count / tokens.length; // Normalized TF
  }
  return vector;
}

function padVector(vector: number[], targetLength: number): number[] {
  if (vector.length >= targetLength) return vector;
  return [...vector, ...new Array(targetLength - vector.length).fill(0)];
}

function cosineSimilarity(a: number[], b: number[]): number {
  const maxLen = Math.max(a.length, b.length);
  const va = padVector(a, maxLen);
  const vb = padVector(b, maxLen);

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < maxLen; i++) {
    dot += va[i] * vb[i];
    normA += va[i] * va[i];
    normB += vb[i] * vb[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export function registerRoutes(app: Hono) {
  app.post("/api/search", async (c) => {
    await tryRequirePayment(0.005);
    const body = await c.req.json().catch(() => null);
    if (!body?.query) {
      return c.json({ error: "Missing required field: query" }, 400);
    }

    const query: string = body.query;
    const topK: number = Math.min(Math.max(parseInt(body.topK) || 3, 1), 10);
    const namespace: string = body.namespace || "default";

    // Store new documents if provided
    if (body.documents && Array.isArray(body.documents)) {
      if (!store.has(namespace)) {
        store.set(namespace, []);
      }
      const docs = store.get(namespace)!;
      for (const doc of body.documents) {
        if (typeof doc === "string" && doc.trim()) {
          const tokens = tokenize(doc);
          const vector = buildVector(tokens);
          docs.push({ text: doc, vector });
        }
      }
    }

    const docs = store.get(namespace);
    if (!docs || docs.length === 0) {
      return c.json({
        error: "No documents in namespace '" + namespace + "'. Provide documents array to index first.",
      }, 400);
    }

    // Vectorize query
    const queryTokens = tokenize(query);
    const queryVector = buildVector(queryTokens);

    // Compute similarities
    const scored = docs.map((doc, index) => ({
      index,
      text: doc.text,
      similarity: cosineSimilarity(queryVector, doc.vector),
    }));

    // Sort by similarity descending
    scored.sort((a, b) => b.similarity - a.similarity);
    const results = scored.slice(0, topK);

    return c.json({
      query,
      namespace,
      totalDocuments: docs.length,
      resultCount: results.length,
      results: results.map((r) => ({
        text: r.text,
        similarity: Math.round(r.similarity * 10000) / 10000,
        index: r.index,
      })),
      timestamp: new Date().toISOString(),
    });
  });
}
