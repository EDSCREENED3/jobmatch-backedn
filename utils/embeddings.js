const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

/**
 * Generate an embedding vector for a piece of text.
 */
async function embed(text) {
  const trimmed = text.slice(0, 8000); // stay within token limits
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: trimmed,
  });
  return res.data[0].embedding;
}

/**
 * Cosine similarity between two embedding vectors.
 * Returns a value between -1 and 1 (higher = more similar).
 */
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Batch-embed multiple texts with rate-limit safety.
 */
async function batchEmbed(texts, batchSize = 5) {
  const results = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const embeddings = await Promise.all(batch.map(embed));
    results.push(...embeddings);
    if (i + batchSize < texts.length) {
      await new Promise(r => setTimeout(r, 200)); // small delay to avoid rate limits
    }
  }
  return results;
}

module.exports = { openai, embed, cosineSimilarity, batchEmbed };
