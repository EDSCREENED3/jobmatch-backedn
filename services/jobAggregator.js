const { fetchAllAdzunaKeywords } = require('./adzuna');
const { fetchAllReedKeywords } = require('./reed');
const supabase = require('../utils/supabase');

/**
 * Fetch jobs from all sources, deduplicate, and upsert to Supabase.
 */
async function fetchAndCacheJobs() {
  const [adzunaJobs, reedJobs] = await Promise.all([
    fetchAllAdzunaKeywords(),
    fetchAllReedKeywords(),
  ]);

  const allJobs = [...adzunaJobs, ...reedJobs];
  console.log(`[Aggregator] Total jobs fetched: ${allJobs.length}`);

  if (!allJobs.length) return [];

  // Upsert into Supabase (on conflict: external_id)
  const { error } = await supabase
    .from('jobs')
    .upsert(allJobs, { onConflict: 'external_id', ignoreDuplicates: false });

  if (error) {
    console.error('[Aggregator] Supabase upsert error:', error.message);
  }

  return allJobs;
}

/**
 * Fetch recent jobs from Supabase cache (last 7 days).
 */
async function getCachedJobs(limit = 200) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .gte('posted_at', since)
    .order('posted_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[Aggregator] Fetch from cache error:', error.message);
    return [];
  }

  return data || [];
}

module.exports = { fetchAndCacheJobs, getCachedJobs };
