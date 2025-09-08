const AUTH_URL = 'http://20.244.56.144/evaluation-service/auth';
const LOG_URL = 'http://20.244.56.144/evaluation-service/logs';

let fetchImpl = null;
async function fetchUrl(url, options) {
  if (!fetchImpl) {
    try {
      const mod = await import('node-fetch');
      fetchImpl = mod.default;
    } catch (e) {
      throw new Error('node-fetch is required in logging-middleware');
    }
  }
  return fetchImpl(url, options);
}

let cachedToken = null;
let tokenExpiry = 0;

async function getToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry - 60000) return cachedToken;

  const body = {
    email: process.env.AFF_AUTH_EMAIL,
    name: process.env.AFF_AUTH_NAME,
    rollNo: process.env.AFF_AUTH_ROLLNO,
    accessCode: process.env.AFF_ACCESS_CODE,
    clientID: process.env.AFF_CLIENT_ID,
    clientSecret: process.env.AFF_CLIENT_SECRET
  };

  const res = await fetchUrl(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`auth failed ${res.status}: ${txt}`);
  }
  const data = await res.json();
  cachedToken = `${data.token_type} ${data.access_token}`;
  tokenExpiry = Date.now() + ((data.expires_in || 600) * 1000);
  return cachedToken;
}

const stacks = new Set(['backend', 'frontend']);
const levels = new Set(['debug', 'info', 'warn', 'error', 'fatal']);
const backendPkgs = new Set(['cache','controller','cron_job','db','domain','handler','repository','route','service']);
const frontendPkgs = new Set(['api','component','hook','page','state','style']);
const commonPkgs = new Set(['auth','config','middleware','utils']);

function pkgAllowed(stack, pkg) {
  if (commonPkgs.has(pkg)) return true;
  if (stack === 'backend') return backendPkgs.has(pkg);
  if (stack === 'frontend') return frontendPkgs.has(pkg);
  return false;
}

async function log(stack, level, pkg, message) {
  stack = String(stack || '').toLowerCase();
  level = String(level || '').toLowerCase();
  pkg = String(pkg || '').toLowerCase();
  if (!stacks.has(stack)) throw new Error('invalid stack');
  if (!levels.has(level)) throw new Error('invalid level');
  if (!pkgAllowed(stack, pkg)) throw new Error('invalid package for stack');

  const token = await getToken();
  const res = await fetchUrl(LOG_URL, {
    method: 'POST',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ stack, level, package: pkg, message: String(message || '') })
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`log api failed ${res.status}: ${txt}`);
  }
}

module.exports = { log };


