import { prisma } from '@kids-reporter/db'
import { emitStructured } from '@kids-reporter/logger'
import http from 'http'

import { createApp } from './app.js'
import envVar from './environment-variables.js'

const parsePort = (raw: string | undefined): number => {
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : 8081
}

const port = parsePort(process.env.PORT)
const SHUTDOWN_TIMEOUT_MS = 30_000

async function start() {
  let server: http.Server | undefined
  try {
    const app = createApp({
      gcpProjectId: envVar.gcp.projectId,
      corsAllowOrigin: envVar.cors.allowOrigins,
    })
    server = http.createServer(app)
    // Defensive timeouts: reduce exposure to slowloris/hung connections.
    server.requestTimeout = 30_000
    server.headersTimeout = 35_000
    server.keepAliveTimeout = 5_000
    server.on('error', (err) => {
      const message =
        err instanceof Error ? (err.stack ?? err.message) : String(err)
      emitStructured({
        severity: 'ALERT',
        message: `HTTP server error: ${message}`,
        error: err instanceof Error ? err.stack : String(err),
      })
      process.exit(1)
    })
    if (!envVar.goApiJwt.secret) {
      throw new Error('GO_API_JWT_SECRET environment variable is required')
    }
    server.listen(port, () => {
      emitStructured({
        severity: 'INFO',
        message: `server starts at port ${port}`,
      })
    })
  } catch (err) {
    const message =
      err instanceof Error ? (err.stack ?? err.message) : String(err)
    emitStructured({
      severity: 'ALERT',
      message,
      error: err instanceof Error ? err.stack : String(err),
    })
    process.exit(1)
  }

  let shuttingDown = false
  const shutdown = (signal: string) => () => {
    if (shuttingDown || !server) return
    shuttingDown = true

    const forceExitTimer = setTimeout(() => {
      emitStructured({
        severity: 'ALERT',
        message: `Forced shutdown after ${SHUTDOWN_TIMEOUT_MS}ms (${signal})`,
      })
      process.exit(1)
    }, SHUTDOWN_TIMEOUT_MS)
    forceExitTimer.unref()

    server.close(() => {
      clearTimeout(forceExitTimer)
      prisma
        .$disconnect()
        .catch((disconnectErr) => {
          emitStructured({
            severity: 'ERROR',
            message:
              disconnectErr instanceof Error
                ? disconnectErr.message
                : String(disconnectErr),
            error:
              disconnectErr instanceof Error
                ? disconnectErr.stack
                : String(disconnectErr),
          })
        })
        .finally(() => {
          emitStructured({
            severity: 'INFO',
            message: `HTTP server closed (${signal})`,
          })
          process.exit(0)
        })
    })
  }

  process.on('SIGTERM', shutdown('SIGTERM'))
  process.on('SIGINT', shutdown('SIGINT'))
}

start()
