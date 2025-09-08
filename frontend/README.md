Frontend (React + Vite + MUI)

Run

```
cd frontend
npm i
npm run dev
# http://localhost:3000
```

Config

- `frontend/.env`
```
VITE_API_BASE=http://localhost:8080
```

Features

- Shorten tab: up to 5 rows, per-row delete, placeholders, IST times
- Statistics tab: lists all existing links, expandable details, delete link, auto-refresh when new links are created, IST times
- Tab persistence via URL hash (#shorten/#stats)
- Original URL is clickable in details

Logging

- Frontend sends logs to backend `/logs`, which calls the logging-middleware server-side


