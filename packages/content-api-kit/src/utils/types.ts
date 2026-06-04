import type express from 'express'

export type ContentApiCorsMode = 'public' | 'credentialed' | 'none'

export type ContentApiRouteMount = {
  path: string
  router: express.Router
  /** Defaults to `public`. */
  corsMode?: ContentApiCorsMode
}

export type ContentApiOpenApiMount = {
  enabled: boolean
  /** Defaults to `/openapi`. */
  path?: string
  /** Defaults to `public`. */
  corsMode?: ContentApiCorsMode
  router: express.Router
}

export type CreateContentApiAppOptions = {
  /** Used as a prefix for mounted route paths. Trailing slashes are trimmed. */
  basePath?: string

  /** Express request body JSON limit (defaults to 1mb). */
  jsonLimit?: string

  /** CORS allow origin (string or allowlist). Required if you enable CORS modes. */
  corsAllowOrigin: string[] | string

  /** Optional middleware injected early (e.g., structured logger). */
  loggerMiddleware?: express.RequestHandler

  /** Optional middleware applied before any routes are mounted. */
  beforeRoutes?: express.RequestHandler[]

  /** Routes to mount (typically includes `/v1`). */
  routes: ContentApiRouteMount[]

  /** Optional OpenAPI router mount. The kit does not generate OpenAPI itself. */
  openApi?: ContentApiOpenApiMount

  /** Optional custom error handler; defaults to `defaultErrorHandler`. */
  errorHandler?: express.ErrorRequestHandler
}
