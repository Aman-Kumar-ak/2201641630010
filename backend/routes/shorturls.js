const express = require('express');
const router = express.Router();
const { createShort } = require('../services/shorturls');
const { log } = require('../../logging-middleware');
const store = require('../store/memory');

router.post('/', async (req, res, next) => {
  try {
    const { url, validity, shortcode } = req.body || {};
    const result = createShort({ url, validity, shortcode });
    if (result.error) {
      await log('backend','error','handler',`createShort failed: ${result.error}`);
      return res.status(result.code).json({ error: result.error });
    }
    const base = `${req.protocol}://${req.get('host')}`;
    const shortLink = `${base}/${result.code}`;
    await log('backend','info','service',`created ${result.code}`);
    return res.status(201).json({ shortLink, expiry: result.expiresAt.toISOString() });
  } catch (e) { next(e); }
});

// List all existing short URLs
router.get('/', async (req, res, next) => {
  try {
    const items = [];
    for (const [code, rec] of store.urls.entries()) {
      items.push({
        code,
        url: rec.url,
        createdAt: rec.createdAt.toISOString(),
        expiry: rec.expiresAt.toISOString(),
        totalClicks: rec.clicks.length
      });
    }
    await log('backend','debug','route',`list_all count=${items.length}`);
    res.json({ items });
  } catch (e) { next(e); }
});

router.get('/:code', async (req, res, next) => {
  try {
    const store = require('../store/memory');
    const code = req.params.code;
    const rec = store.urls.get(code);
    if (!rec) return res.status(404).json({ error: 'not found' });
    const data = {
      totalClicks: rec.clicks.length,
      original: {
        url: rec.url,
        createdAt: rec.createdAt.toISOString(),
        expiry: rec.expiresAt.toISOString()
      },
      clicks: rec.clicks.map(c => ({ ts: c.ts.toISOString(), referrer: c.referrer, location: c.location }))
    };
    return res.json(data);
  } catch (e) { next(e); }
});

// Delete a short URL by code
router.delete('/:code', async (req, res, next) => {
  try {
    const code = req.params.code;
    if (!store.urls.has(code)) return res.status(404).json({ error: 'not found' });
    store.urls.delete(code);
    try { store.save(); } catch {}
    await log('backend','info','route',`deleted ${code}`);
    return res.status(204).send();
  } catch (e) { next(e); }
});

module.exports = router;


