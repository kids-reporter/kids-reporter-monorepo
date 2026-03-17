import { emitStructured } from '@kids-reporter/logger'
import http from 'http'

import { createApp } from './app.js'
import envVar from './environment-variables.js'

const port = process.env.PORT || '8080'

async function start() {
  let server: http.Server
  try {
    const app = createApp({
      gcpProjectId: envVar.gcp.projectId,
      corsAllowOrigin: envVar.cors.allowOrigins,
      gql: {
        headlessAccount: envVar.apis.gql.headlessAccount,
        apiOrigin: envVar.apis.gql.origin,
      },
    })
    server = http.createServer(app).listen(port, () => {
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
  }

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received')
    if (server) {
      console.log('Close HTTP server')
      server.close(() => {
        console.log('HTTP server closed')
      })
    }
  })

  process.on('SIGINT', () => {
    console.log('SIGINT signal received')
    if (server) {
      console.log('Close HTTP server')
      server.close(() => {
        console.log('HTTP server closed')
      })
    }
  })
}

start()
