const axios = require('axios');

const ADZUNA_BASE = 'https://api.adzuna.com/v1/api/jobs/gb/search/1';

const KEYWORDS = [
  'finance graduate 2026 analyst',
  'graduate programme 2026 London',
  'off-cycle analyst fintech London',
  'investment banking analyst programme 2026',
  'graduate scheme finance London',
];

async function fetchAdzunaJobs(keyword = KEYWORDS[0], count = 40) {
  try {
    const res = await axios.get(ADZUNA_BASE, {
      params: {
        app_id: process.env.ADZUNA_APP_ID,
        app_key: process.env.ADZUNA_APP_KEY,
        results_per_page: count,
        what: keyword,
        where: 'London',
        sort_by: 'date',
      },
      timeout: 10000,
    });

    return res.data.results.map(job => ({
      external_id: `adzuna-${job.id}`,
      source: 'adzuna',
      title: job.title,
      company: job.company?.display_name || 'Unknown',
      location: job.location?.display_name || 'London',
      description: job.description || '',
      url: job.redirect_url,
      salary_min: job.salary_min || null,
      salary_max: job.salary_max || null,
      posted_at: job.created || new Date().toISOString(),
    }));
  } catch (err) {
    console.error('[Adzuna] Error:', err.message);
    return [];
  }
}

async function fetchAllAdzunaKeywords() {
  const results = await Promise.all(KEYWORDS.map(k => fetchAdzunaJobs(k, 20)));
  // Deduplicate by external_id
  const seen = new Set();
  const flat = results.flat().filter(j => {
    if (seen.has(j.external_id)) return false;
    seen.add(j.external_id);
    return true;
  });
  return flat;
}

module.exports = { fetchAdzunaJobs, fetchAllAdzunaKeywords };
