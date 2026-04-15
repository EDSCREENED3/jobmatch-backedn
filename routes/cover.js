const express = require('express');
const router = express.Router();
const { generateCoverLetter, tailorCVSummary } = require('../services/coverLetter');

/**
 * POST /api/cover/letter
 * Body: { cv, jobTitle, company, jobDescription? }
 */
router.post('/letter', async (req, res, next) => {
  try {
    const { cv, jobTitle, company, jobDescription } = req.body;

    if (!cv || !jobTitle || !company) {
      return res.status(400).json({ error: 'cv, jobTitle, and company are required.' });
    }

    const letter = await generateCoverLetter(cv, jobTitle, company, jobDescription);
    res.json({ success: true, coverLetter: letter });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/cover/summary
 * Body: { cv, jobTitle, company }
 */
router.post('/summary', async (req, res, next) => {
  try {
    const { cv, jobTitle, company } = req.body;

    if (!cv || !jobTitle || !company) {
      return res.status(400).json({ error: 'cv, jobTitle, and company are required.' });
    }

    const summary = await tailorCVSummary(cv, jobTitle, company);
    res.json({ success: true, summary });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
