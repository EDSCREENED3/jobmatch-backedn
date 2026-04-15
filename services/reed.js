const axios = require('axios');

// Reed API uses HTTP Basic Auth: API key as username, empty password
const REED_BASE = 'https://www.reed.co.uk/api/1.0/search';

const REED_KEYWORDS = [
  'graduate finance analyst 2026',
  'graduate scheme investment banking',
  'fintech graduate analyst London',
];

async function fetchReedJobs(keyword = REED_KEYWORDS[0], count = 25) {
  if (!process.env.REED_API_KEY) {
    console.warn('[Reed] No REED_API_KEY set, skipping.');
    return [];
  }

  try {
    const res = await axios.get(REED_BASE, {
      params: {
        keywords: keyword,
        locationName: 'London',
        resultsToTake: count,
        minimumSalary: 25000,
      },
      auth: {
        username: process.env.REED_API_KEY,
        password: '',
      },
      timeout: 10000,
    });

    return (res.data.results || []).map(job => ({
      external_id: `reed-${job.jobId}`,
      source: 'reed',
      title: job.jobTitle,
      company: job.employerName || 'Unknown',
      location: job.locationName || 'London',
      description: job.jobDescription || '',
      url: job.jobUrl,
      salary_min: job.minimumSalary || null,
      salary_max: job.maximumSalary || null,
      posted_at: job.date || new Date().toISOString(),
    }));
  } catch (err) {
    console.error('[Reed] Error:', err.message);
    return [];
  }
}

async function fetchAllReedKeywords() {
  const results = await Promise.all(REED_KEYWORDS.map(k => fetchReedJobs(k, 20)));
  const seen = new Set();
  return results.flat().filter(j => {
    if (seen.has(j.external_id)) return false;
    seen.add(j.external_id);
    return true;
  });
}

module.exports = { fetchReedJobs, fetchAllReedKeywords };
