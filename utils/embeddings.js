const axios = require('axios');

const COHERE_API = 'https://api.cohere.ai/v1';

/**
 * Generate an embedding vector using Cohere's free embed model.
 */
async function embed(text) {
  const trimmed = text.slice(0, 4000);
  const res = await axios.post(
    `${COHERE_API}/embed`,
    {
      texts: [trimmed],
      model: 'embed-english-v3.0',
      input_type: 'search_document',
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return res.data.embeddings[0];
}

/**
 * Cosine similarity between two vectors.
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
 * Batch embed multiple texts (Cohere allows up to 96 per request).
 */
async function batchEmbed(texts, batchSize = 48) {
  const results = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize).map(t => t.slice(0, 4000));
    const res = await axios.post(
      `${COHERE_API}/embed`,
      {
        texts: batch,
        model: 'embed-english-v3.0',
        input_type: 'search_document',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    results.push(...res.data.embeddings);
    if (i + batchSize < texts.length) {
      await new Promise(r => setTimeout(r, 300));
    }
  }
  return results;
}

/**
 * Generate text using Cohere's free command model.
 */
async function generateText(prompt) {
  const res = await axios.post(
    `${COHERE_API}/generate`,
    {
      model: 'command',
      prompt,
      max_tokens: 400,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return res.data.generations[0].text.trim();
}

module.exports = { embed, cosineSimilarity, batchEmbed, generateText };
