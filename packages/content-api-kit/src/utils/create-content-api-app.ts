import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'

import { defaultErrorHandler } from './default-error-handler.js'
import type {
  ContentApiCorsMode,
  ContentApiRouteMount,
  CreateContentApiAppOptions,
} from './types.js'

function normalizeBasePath(raw?: string): string {
  const s = (raw ?? '').trim()
  if (!s) return ''
  if (s === '/') return ''
  return s.replace(/\/+$/, '')
}

function buildCorsOptions({
  corsAllowOrigin,
  credentialed,
}: {
  corsAllowOrigin: string[] | string
  credentialed: boolean
}): cors.CorsOptions {
  if (credentialed && corsAllowOrigin === '*') {
    // Mirrors existing `content-api` behavior: `*` cannot be used with credentialed routes.
    return { origin: false, credentials: true }
  }
  return { origin: corsAllowOrigin, credentials: credentialed }
}

function joinBasePath(basePath: string, path: string): string {
  if (!basePath) return path
  if (!path || path === '/') return basePath
  return `${basePath}${path.startsWith('/') ? '' : '/'}${path}`
}

export function createContentApiApp(
  options: CreateContentApiAppOptions
): express.Application {
  const app = express()

  const basePath = normalizeBasePath(options.basePath)
  const jsonLimit = options.jsonLimit ?? '1mb'

  const publicCorsOpts = buildCorsOptions({
    corsAllowOrigin: options.corsAllowOrigin,
    credentialed: false,
  })
  const credentialedCorsOpts = buildCorsOptions({
    corsAllowOrigin: options.corsAllowOrigin,
    credentialed: true,
  })

  if (options.loggerMiddleware) {
    app.use(options.loggerMiddleware)
  }
  app.use(cookieParser())
  app.use(express.json({ limit: jsonLimit }))

  if (options.beforeRoutes?.length) {
    app.use(...options.beforeRoutes)
  }

  const mountRoute = (m: ContentApiRouteMount) => {
    const mountPath = joinBasePath(basePath, m.path)
    const mode: ContentApiCorsMode = m.corsMode ?? 'public'
    if (mode === 'credentialed') {
      app.use(mountPath, cors(credentialedCorsOpts), m.router)
    } else if (mode === 'public') {
      app.use(mountPath, cors(publicCorsOpts), m.router)
    } else {
      app.use(mountPath, m.router)
    }
  }

  const routes = options.routes ?? []
  const credentialedRoutes = routes.filter(
    (m) => (m.corsMode ?? 'public') === 'credentialed'
  )
  const otherRoutes = routes.filter(
    (m) => (m.corsMode ?? 'public') !== 'credentialed'
  )

  // Credentialed routes before OpenAPI so a root-mounted public OpenAPI CORS
  // layer does not answer /auth/* preflight with credentials: false.
  for (const m of credentialedRoutes) {
    mountRoute(m)
  }

  if (options.openApi?.enabled) {
    const openApiPath = options.openApi.path ?? '/openapi'
    const openApiMountPath = joinBasePath(basePath, openApiPath)
    const openApiCorsMode: ContentApiCorsMode =
      options.openApi.corsMode ?? 'public'
    if (openApiCorsMode === 'credentialed') {
      app.use(
        openApiMountPath,
        cors(credentialedCorsOpts),
        options.openApi.router
      )
    } else if (openApiCorsMode === 'public') {
      app.use(openApiMountPath, cors(publicCorsOpts), options.openApi.router)
    } else {
      app.use(openApiMountPath, options.openApi.router)
    }
  }

  for (const m of otherRoutes) {
    mountRoute(m)
  }

  app.use(options.errorHandler ?? defaultErrorHandler)

  return app
}

export type { ContentApiCorsMode, CreateContentApiAppOptions } from './types.js'
