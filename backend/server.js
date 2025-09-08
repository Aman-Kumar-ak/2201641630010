require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { log } = require('../logging-middleware');
const shortUrlRoutes = require('./routes/shorturls');
const logsProxy = require('./routes/logs');
const { get } = require('./services/shorturls');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/shorturls', shortUrlRoutes);
app.use('/logs', logsProxy);

// redirection route
app.get('/:code', async (req, res, next) => {
  try {
    const code = req.params.code;
    const result = get(code);
    if (result.error) {
      await log('backend','warn','route',`redirect fail ${code}: ${result.error}`);
      return res.status(result.code).json({ error: result.error });
    }
    const rec = result.rec;
    const ref = req.get('referer') || 'direct';
    const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0] || req.ip || 'unknown';
    const location = ip; // coarse
    rec.clicks.push({ ts: new Date(), referrer: ref, location });
    try { require('./store/memory').save(); } catch {}
    await log('backend','info','route',`redirect ${code}`);
    return res.redirect(302, rec.url);
  } catch (e) { next(e); }
});

// simple error handler
app.use(async (err, req, res, next) => {
  try { await log('backend','error','middleware', err.message || 'unknown error'); } catch {}
  res.status(500).json({ error: 'internal error' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  try { await log('backend','info','service',`server started on ${PORT}`); } catch {}
  console.log(`server on http://localhost:${PORT}`);
});


