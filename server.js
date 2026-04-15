require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const jobRoutes = require('./routes/jobs');
const trackingRoutes = require('./routes/tracking');
const coverRoutes = require('./routes/cover');
const { fetchAndCacheJobs } = require('./services/jobAggregator');

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/track', trackingRoutes);
app.use('/api/cover', coverRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Cron: fetch new jobs every hour
cron.schedule('0 * * * *', async () => {
  console.log('[Cron] Fetching fresh jobs...');
  try {
    await fetchAndCacheJobs();
    console.log('[Cron] Jobs updated successfully');
  } catch (err) {
    console.error('[Cron] Failed to fetch jobs:', err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
