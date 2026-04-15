const { embed, batchEmbed, cosineSimilarity } = require('../utils/embeddings');
const { getCachedJobs, fetchAndCacheJobs } = require('./jobAggregator');

/**
 * Core matching engine.
 * Takes a CV string, embeds it, compares against job descriptions,
 * returns ranked jobs with scores.
 */
async function matchJobs(cvText, topN = 20) {
  // 1. Embed the CV
  console.log('[Matcher] Embedding CV...');
  const cvVector = await embed(cvText);

  // 2. Get jobs from cache (or fetch fresh if cache is empty)
  let jobs = await getCachedJobs(200);
  if (!jobs.length) {
    console.log('[Matcher] Cache empty, fetching fresh jobs...');
    jobs = await fetchAndCacheJobs();
  }

  if (!jobs.length) {
    return [];
  }

  // 3. Embed job texts (title + description)
  console.log(`[Matcher] Embedding ${jobs.length} jobs...`);
  const jobTexts = jobs.map(j => `${j.title} at ${j.company}. ${j.description}`.slice(0, 4000));
  const jobVectors = await batchEmbed(jobTexts, 8);

  // 4. Score each job
  const scored = jobs.map((job, i) => ({
    ...job,
    score: parseFloat(cosineSimilarity(cvVector, jobVectors[i]).toFixed(4)),
  }));

  // 5. Sort and return top N
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN);
}

module.exports = { matchJobs };
