Logging Middleware (JS)

Purpose

- Single function `log(stack, level, pkg, message)` to send logs to the Affordmed evaluation service with automatic authentication and token caching.

Install

```
cd logging-middleware
npm i
```

Environment (consumed at runtime)

Provide via the host app (backend server) process environment:
```
AFF_AUTH_EMAIL=...
AFF_AUTH_NAME=...
AFF_AUTH_ROLLNO=...
AFF_ACCESS_CODE=...
AFF_CLIENT_ID=...
AFF_CLIENT_SECRET=...
```

Usage (CommonJS)

```js
const { log } = require('../logging-middleware')

async function example() {
  await log('backend','info','service','server started')
}
```

Parameters

- stack: `backend | frontend`
- level: `debug | info | warn | error | fatal`
- pkg: backend: `cache|controller|cron_job|db|domain|handler|repository|route|service`, frontend: `api|component|hook|page|state|style`, shared: `auth|config|middleware|utils`
- message: string

Notes

- Token is fetched on first use and refreshed automatically before expiry.
- Errors from the log endpoint are surfaced as thrown errors.


