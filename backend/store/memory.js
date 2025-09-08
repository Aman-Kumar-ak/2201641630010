const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'urls.json');

function revive(rec) {
  return {
    url: rec.url,
    createdAt: new Date(rec.createdAt),
    expiresAt: new Date(rec.expiresAt),
    clicks: (rec.clicks || []).map(c => ({ ts: new Date(c.ts), referrer: c.referrer, location: c.location }))
  };
}

function load() {
  try {
    if (!fs.existsSync(dataFile)) return new Map();
    const raw = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
    const m = new Map();
    for (const [code, rec] of Object.entries(raw)) m.set(code, revive(rec));
    return m;
  } catch {
    return new Map();
  }
}

function save(urls) {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const obj = Object.fromEntries(
      Array.from(urls.entries()).map(([code, rec]) => [code, {
        url: rec.url,
        createdAt: rec.createdAt.toISOString(),
        expiresAt: rec.expiresAt.toISOString(),
        clicks: rec.clicks.map(c => ({ ts: c.ts.toISOString(), referrer: c.referrer, location: c.location }))
      }])
    );
    fs.writeFileSync(dataFile, JSON.stringify(obj, null, 2));
  } catch {}
}

const store = { urls: load(), save: () => save(store.urls) };

module.exports = store;


