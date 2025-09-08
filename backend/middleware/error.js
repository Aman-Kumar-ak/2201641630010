const { log } = require('../../logging-middleware');

async function errorHandler(err, req, res, next) {
  try { await log('backend','error','middleware', err.message || 'unknown error'); } catch {}
  res.status(500).json({ error: 'internal error' });
}

module.exports = errorHandler;


