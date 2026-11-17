import type { Server } from 'node:http'

import { emitStructured } from '@kids-reporter/logger'

export const SHUTDOWN_TIMEOUT_MS = 8_000
const IDLE_REAP_MS = 50

type ShutdownHttpServerOptions = {
  server: Server
  signal: string
  disconnect: () => Promise<unknown>
  exit?: (code: number) => void
  timeoutMs?: number
}

export function shutdownHttpServer({
  server,
  signal,
  disconnect,
  exit = process.exit,
  timeoutMs = SHUTDOWN_TIMEOUT_MS,
}: ShutdownHttpServerOptions): void {
  let finished = false
  const finish = (code: number) => {
    if (finished) return
    finished = true
    clearTimeout(forceExitTimer)
    clearInterval(reapTimer)
    exit(code)
  }

  const forceExitTimer = setTimeout(() => {
    emitStructured({
      severity: 'ALERT',
      message: `Forced shutdown after ${timeoutMs}ms (${signal})`,
    })
    finish(1)
  }, timeoutMs)
  forceExitTimer.unref()

  const reapTimer = setInterval(() => {
    server.closeIdleConnections()
  }, IDLE_REAP_MS)
  reapTimer.unref()

  server.close(() => {
    clearInterval(reapTimer)
    disconnect()
      .catch((disconnectErr: unknown) => {
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
        finish(0)
      })
  })
}
