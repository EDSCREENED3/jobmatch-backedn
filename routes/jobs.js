const express = require('express');
const router = express.Router();
const { matchJobs } = require('../services/matcher');
const { fetchAndCacheJobs } = require('../services/jobAggregator');

/**
 * POST /api/jobs/match
 * Body: { cv: string, topN?: number }
 * Returns top matched jobs ranked by similarity score.
 */
router.post('/match', async (req, res, next) => {
  try {
    const { cv, topN = 20 } = req.body;

    if (!cv || typeof cv !== 'string' || cv.trim().length < 50) {
      return res.status(400).json({ error: 'Please provide a CV with at least 50 characters.' });
    }

    console.log('[Route] /match called, CV length:', cv.length);
    const jobs = await matchJobs(cv.trim(), parseInt(topN));

    res.json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/jobs/refresh
 * Manually trigger a job fetch & cache update.
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const jobs = await fetchAndCacheJobs();
    res.json({ success: true, fetched: jobs.length });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
