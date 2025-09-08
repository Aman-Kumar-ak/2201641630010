URL Shortener – JS (Backend + Frontend) with Centralized Logging

Structure

- logging-middleware/ – Reusable JS logger that authenticates and posts logs to the Affordmed service
- backend/ – Express server: create/list/get/delete short URLs, redirect, persistence to file
- frontend/ – React + Vite + MUI app on http://localhost:3000

Prerequisites

- Node.js 18+

Setup

1) Install dependencies

   - logging-middleware
     - cd logging-middleware && npm i
   - backend
     - cd backend && npm i
   - frontend
     - cd frontend && npm i

2) Environment

   - backend/.env
```
PORT=8080

# Registration details
AFF_AUTH_EMAIL=your_email@domain.com
AFF_AUTH_NAME=Your Name
AFF_AUTH_ROLLNO=your_roll_no
AFF_ACCESS_CODE=your_access_code
AFF_AUTH_MOBILE=9999999999
AFF_GITHUB=yourGithubUsername

# Filled after registration success
AFF_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AFF_CLIENT_SECRET=your_client_secret
```

   - frontend/.env
```
VITE_API_BASE=http://localhost:8080
```

3) Get clientID/clientSecret (first time only)

```
cd backend
npm run auth:register
# Copy AFF_CLIENT_ID and AFF_CLIENT_SECRET from the output into backend/.env

npm run auth:test
# Should return token_type/access_token/expires_in
```

Run

- Backend
```
cd backend
npm run dev
# http://localhost:8080
```

- Frontend
```
cd frontend
npm run dev
# http://localhost:3000
```

Key Endpoints (backend)

- POST /shorturls – create short link
  - Body: { url: string, validity?: number, shortcode?: string }
  - Returns 201 { shortLink, expiry } or 200 { shortLink, expiry, existing: true } if URL already exists
- GET /shorturls – list all existing items
- GET /shorturls/:code – stats for a code
- DELETE /shorturls/:code – delete a code
- GET /:code – redirect to original and record a click

Persistence

- File based: backend/data/urls.json
- Saved on create, redirect (click), delete; survives server restarts

Frontend Highlights

- Shorten tab: up to 5 rows, per-row delete, clear placeholders, IST time
- Statistics tab: auto-updates on new creations, accordion per link, original URL clickable, IST time
- Tab persistence via hash (#shorten / #stats) on refresh

Mandatory Logging

- No console logging used for app events
- All logs routed through the logging middleware
  - Backend imports logger directly
  - Frontend calls backend /logs which invokes the logger server-side

Notes

- Frontend strictly runs on http://localhost:3000
- API base is http://localhost:8080 (configurable via frontend/.env)


