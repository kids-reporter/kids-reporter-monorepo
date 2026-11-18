import type { Server } from 'node:http'

import { emitStructured } from '@kids-reporter/logger'

const SHUTDOWN_TIMEOUT_MS = 8_000
const IDLE_REAP_MS = 50

declare global {
  var __KIDS_FRONTEND_HTTP_SERVER: Server | undefined
}

export function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (!process.env.NEXT_MANUAL_SIG_HANDLE) return

  let shuttingDown = false
  const shutdown = (signal: string) => () => {
    if (shuttingDown) return
    shuttingDown = true

    const server = globalThis.__KIDS_FRONTEND_HTTP_SERVER
    if (!server) {
      emitStructured({
        severity: 'ALERT',
        message: `HTTP server missing during shutdown (${signal})`,
      })
      process.exit(1)
    }

    let finished = false
    const finish = (code: number) => {
      if (finished) return
      finished = true
      clearTimeout(forceExitTimer)
      clearInterval(reapTimer)
      process.exit(code)
    }

    const forceExitTimer = setTimeout(() => {
      emitStructured({
        severity: 'ALERT',
        message: `Forced shutdown after ${SHUTDOWN_TIMEOUT_MS}ms (${signal})`,
      })
      finish(1)
    }, SHUTDOWN_TIMEOUT_MS)
    forceExitTimer.unref()

    const reapTimer = setInterval(() => {
      server.closeIdleConnections()
    }, IDLE_REAP_MS)
    reapTimer.unref()

    server.close(() => {
      clearInterval(reapTimer)
      emitStructured({
        severity: 'INFO',
        message: `HTTP server closed (${signal})`,
      })
      finish(0)
    })
  }

  process.on('SIGTERM', shutdown('SIGTERM'))
  process.on('SIGINT', shutdown('SIGINT'))
}
