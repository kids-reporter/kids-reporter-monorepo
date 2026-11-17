import { once } from 'node:events'
import http, { type Server } from 'node:http'
import type { Socket } from 'node:net'

import { emitStructured } from '@kids-reporter/logger'
import { describe, expect, it, vi } from 'vitest'

import { shutdownHttpServer } from './shutdown.js'

vi.mock('@kids-reporter/logger', () => ({
  emitStructured: vi.fn(),
}))

describe('shutdownHttpServer', () => {
  it('closes idle keep-alives, finishes the in-flight request, then disconnects', async () => {
    let releaseInFlight = () => {}
    const inFlightReleased = new Promise<void>((resolve) => {
      releaseInFlight = resolve
    })
    let markInFlightStarted = () => {}
    const inFlightStarted = new Promise<void>((resolve) => {
      markInFlightStarted = resolve
    })

    const server = http.createServer((req, res) => {
      if (req.url === '/slow') {
        markInFlightStarted()
        void inFlightReleased.then(() => {
          res.writeHead(200)
          res.end('ok')
        })
        return
      }
      res.writeHead(200)
      res.end('fast')
    })

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve)
    })

    const address = server.address()
    if (!address || typeof address === 'string') {
      throw new Error('expected a TCP server address')
    }

    server.keepAliveTimeout = 5_000

    const idleAgent = new http.Agent({ keepAlive: true })
    const slowAgent = new http.Agent({ keepAlive: true })
    let idleSocket: Socket | undefined
    try {
      await new Promise<void>((resolve, reject) => {
        const req = http.get(
          {
            hostname: '127.0.0.1',
            port: address.port,
            path: '/fast',
            agent: idleAgent,
          },
          (res) => {
            res.resume()
            res.on('end', () => {
              const socket = req.socket
              if (!socket) {
                reject(new Error('expected an idle keep-alive socket'))
                return
              }
              idleSocket = socket
              socket.on('error', () => {})
              resolve()
            })
          }
        )
        req.on('error', reject)
      })

      if (!idleSocket) {
        throw new Error('expected an idle keep-alive socket')
      }
      expect(idleSocket.destroyed).toBe(false)
      const idleClosed = once(idleSocket, 'close')

      let slowStatus = 0
      const slowDone = new Promise<void>((resolve, reject) => {
        let ended = false
        const req = http.get(
          {
            hostname: '127.0.0.1',
            port: address.port,
            path: '/slow',
            agent: slowAgent,
          },
          (res) => {
            slowStatus = res.statusCode ?? 0
            res.resume()
            res.on('end', () => {
              ended = true
              resolve()
            })
          }
        )
        req.on('error', (err) => {
          if (!ended) reject(err)
        })
      })

      await inFlightStarted

      let disconnected = false
      const exit = vi.fn()
      shutdownHttpServer({
        server,
        signal: 'SIGTERM',
        timeoutMs: 30_000,
        disconnect: async () => {
          disconnected = true
        },
        exit,
      })

      await idleClosed
      expect(idleSocket.destroyed).toBe(true)
      expect(disconnected).toBe(false)

      releaseInFlight()
      await slowDone
      expect(slowStatus).toBe(200)
      const respondedAt = Date.now()

      await vi.waitFor(() => {
        expect(disconnected).toBe(true)
        expect(exit).toHaveBeenCalledWith(0)
      })
      expect(Date.now() - respondedAt).toBeLessThan(1_000)
    } finally {
      idleAgent.destroy()
      slowAgent.destroy()
      if (server.listening) {
        server.close()
      }
    }
  })

  it('force-exits when close never finishes', async () => {
    const exit = vi.fn()
    const server = {
      closeIdleConnections: vi.fn(),
      close: vi.fn(),
    } as unknown as Server

    shutdownHttpServer({
      server,
      signal: 'SIGTERM',
      timeoutMs: 30,
      disconnect: async () => {},
      exit,
    })

    await vi.waitFor(() => {
      expect(exit).toHaveBeenCalledWith(1)
    })
    expect(emitStructured).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'ALERT',
        message: 'Forced shutdown after 30ms (SIGTERM)',
      })
    )
  })

  it('exits 0 when disconnect rejects', async () => {
    const exit = vi.fn()
    const server = {
      closeIdleConnections: vi.fn(),
      close: (cb?: () => void) => {
        cb?.()
      },
    } as unknown as Server

    shutdownHttpServer({
      server,
      signal: 'SIGTERM',
      timeoutMs: 100,
      disconnect: async () => {
        throw new Error('db down')
      },
      exit,
    })

    await vi.waitFor(() => {
      expect(exit).toHaveBeenCalledWith(0)
    })
    await new Promise((resolve) => setTimeout(resolve, 150))
    expect(exit).not.toHaveBeenCalledWith(1)
    expect(emitStructured).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'ERROR', message: 'db down' })
    )
  })
})
