const axios = require('axios');

const ADZUNA_BASE = 'https://api.adzuna.com/v1/api/jobs/gb/search/1';

const KEYWORDS = [
  'graduate finance analyst London 2026',
  'graduate scheme investment banking London',
  'fintech graduate analyst London',
  'law finance graduate programme London',
  'graduate analyst financial services London',
  'wealth management graduate London',
  'capital markets graduate analyst London',
  'corporate finance graduate London 2026',
  'blockchain fintech analyst graduate London',
  'legal analyst graduate London finance',
  'investment analyst graduate programme London',
  'digital assets analyst graduate London',
];

async function fetchAdzunaJobs(keyword, count = 20) {
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
    console.error(`[Adzuna] Error for "${keyword}":`, err.message);
    return [];
  }
}

async function fetchAllAdzunaKeywords() {
  const results = [];
  // Fetch keywords one at a time with delay to avoid 429 rate limiting
  for (const keyword of KEYWORDS) {
    const jobs = await fetchAdzunaJobs(keyword, 15);
    results.push(...jobs);
    await new Promise(r => setTimeout(r, 500));
  }
  // Deduplicate by external_id
  const seen = new Set();
  return results.filter(j => {
    if (seen.has(j.external_id)) return false;
    seen.add(j.external_id);
    return true;
  });
}

module.exports = { fetchAdzunaJobs, fetchAllAdzunaKeywords };
