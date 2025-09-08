Backend (Express)

Setup

1) Copy `.env.sample` to `.env` and fill values (see root README for details)
2) Install deps: `npm i`
3) Optional registration/auth check:
```
npm run auth:register   # prints clientID/secret to add to .env
npm run auth:test       # verifies token retrieval
```
4) Start server:
```
npm run dev
# http://localhost:8080
```

Endpoints

- POST /shorturls — create short link
  - Body: `{ url, validity?, shortcode? }`
  - 201 on create `{ shortLink, expiry }`
  - 200 on reuse `{ shortLink, expiry, existing: true }` if same original URL exists and not expired
- GET /shorturls — list all links `{ items: [...] }`
- GET /shorturls/:code — stats for a code
- DELETE /shorturls/:code — delete a code
- GET /:code — 302 redirect and records a click

Persistence

- File: `backend/data/urls.json` (auto-saved on create/click/delete)

Logging

- Uses the local logging-middleware; no console logs for app events



