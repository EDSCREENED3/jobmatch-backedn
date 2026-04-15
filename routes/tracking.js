const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');

// Helper: upsert an application record
async function upsertApplication(userId, jobId, status) {
  const { error } = await supabase
    .from('applications')
    .upsert(
      { user_id: userId, job_id: jobId, status, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,job_id' }
    );

  if (error) throw new Error(error.message);
}

/**
 * POST /api/track/save
 * Body: { userId, jobId }
 */
router.post('/save', async (req, res, next) => {
  try {
    const { userId, jobId } = req.body;
    if (!userId || !jobId) return res.status(400).json({ error: 'userId and jobId required' });

    const { error } = await supabase
      .from('saved_jobs')
      .upsert({ user_id: userId, job_id: jobId }, { onConflict: 'user_id,job_id' });

    if (error) throw new Error(error.message);
    res.json({ success: true, status: 'saved' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/track/apply
 * Body: { userId, jobId }
 */
router.post('/apply', async (req, res, next) => {
  try {
    const { userId, jobId } = req.body;
    if (!userId || !jobId) return res.status(400).json({ error: 'userId and jobId required' });

    await upsertApplication(userId, jobId, 'applied');
    res.json({ success: true, status: 'applied' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/track/reject
 * Body: { userId, jobId }
 */
router.post('/reject', async (req, res, next) => {
  try {
    const { userId, jobId } = req.body;
    if (!userId || !jobId) return res.status(400).json({ error: 'userId and jobId required' });

    await upsertApplication(userId, jobId, 'rejected');
    res.json({ success: true, status: 'rejected' });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/track/dashboard?userId=xxx
 * Returns saved + applied + rejected jobs for a user.
 */
router.get('/dashboard', async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const [savedRes, appsRes] = await Promise.all([
      supabase
        .from('saved_jobs')
        .select('*, jobs(*)')
        .eq('user_id', userId),
      supabase
        .from('applications')
        .select('*, jobs(*)')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false }),
    ]);

    if (savedRes.error) throw new Error(savedRes.error.message);
    if (appsRes.error) throw new Error(appsRes.error.message);

    const applied = appsRes.data.filter(a => a.status === 'applied');
    const rejected = appsRes.data.filter(a => a.status === 'rejected');

    res.json({
      success: true,
      saved: savedRes.data || [],
      applied,
      rejected,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
