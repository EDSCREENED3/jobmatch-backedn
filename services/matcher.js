const { embed, batchEmbed, cosineSimilarity } = require('../utils/embeddings');
const { fetchAllAdzunaKeywords } = require('./adzuna');

/**
 * Core matching engine - fetches fresh jobs every time (no Supabase dependency).
 */
async function matchJobs(cvText, topN = 20) {
  console.log('[Matcher] Embedding CV...');
  const cvVector = await embed(cvText);

  console.log('[Matcher] Fetching fresh jobs from Adzuna...');
  const jobs = await fetchAllAdzunaKeywords();

  if (!jobs.length) {
    console.log('[Matcher] No jobs fetched from any source.');
    return [];
  }

  console.log(`[Matcher] Embedding ${jobs.length} jobs...`);
  const jobTexts = jobs.map(j => `${j.title} at ${j.company}. ${j.description}`.slice(0, 4000));
  const jobVectors = await batchEmbed(jobTexts, 48);

  const scored = jobs.map((job, i) => ({
    ...job,
    score: parseFloat(cosineSimilarity(cvVector, jobVectors[i]).toFixed(4)),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN);
}

module.exports = { matchJobs };
