# @kids-reporter/content-api-kit

Reusable Express app kit for building “content-api”-style HTTP services with consistent CORS, JSON parsing, and error handling.

## Install

```bash
yarn add @kids-reporter/content-api-kit
```

## Usage

```ts
import express from 'express'
import { createContentApiApp } from '@kids-reporter/content-api-kit'

const v1Router = express.Router()
v1Router.get('/healthz', (_req, res) => res.json({ ok: true }))

export const app = createContentApiApp({
  corsAllowOrigin: ['https://example.com'],
  routes: [{ path: '/v1', router: v1Router }],
})
```

## Optional Go API JWT middleware

```ts
import express from 'express'
import { verifyGoApiJwt } from '@kids-reporter/content-api-kit/auth/go-api-jwt'

const router = express.Router()
router.use(
  verifyGoApiJwt({
    secret: process.env.GO_API_JWT_SECRET ?? '',
    issuer: 'https://go-api.twreporter.org',
    audience: 'https://www.twreporter.org',
    onReject: (info, res) => {
      // Optional: log rejections with request trace fields from your logger middleware
      console.warn('JWT rejected', info, res.locals)
    },
  })
)
router.get('/me', (req, res) => res.json({ userId: req.goApiJwtUserId }))
```
