const crypto = require('crypto');
const store = require('../store/memory');

function validURL(u) {
  try {
    const x = new URL(u);
    return x.protocol === 'http:' || x.protocol === 'https:';
  } catch {
    return false;
  }
}

function generateCode() {
  return crypto.randomBytes(4).toString('base64url');
}

function ensureUnique(code) {
  let c = code;
  while (store.urls.has(c)) c = generateCode();
  return c;
}

function createShort({ url, validity, shortcode }) {
  if (!validURL(url)) return { error: 'invalid url', code: 400 };
  const minutes = validity == null ? 30 : Number.parseInt(validity, 10);
  if (!Number.isFinite(minutes) || minutes <= 0) return { error: 'invalid validity', code: 400 };

  let code = shortcode ? String(shortcode) : generateCode();
  if (!/^[a-zA-Z0-9_-]{4,16}$/.test(code)) return { error: 'invalid shortcode', code: 400 };
  if (store.urls.has(code) && !shortcode) code = ensureUnique(code);
  if (store.urls.has(code) && shortcode) return { error: 'shortcode already exists', code: 409 };

  const now = new Date();
  const expiresAt = new Date(now.getTime() + minutes * 60 * 1000);
  store.urls.set(code, { url, createdAt: now, expiresAt, clicks: [] });
  try { store.save(); } catch {}
  return { code, expiresAt };
}

function get(code) {
  const rec = store.urls.get(code);
  if (!rec) return { error: 'not found', code: 404 };
  if (rec.expiresAt <= new Date()) return { error: 'link expired', code: 404 };
  return { rec };
}

module.exports = { createShort, get };


