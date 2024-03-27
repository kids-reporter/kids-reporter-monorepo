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
      iap: envVar.gcp.iap,
    })
    server = http.createServer(app).listen(port, () => {
      console.log(
        JSON.stringify({
          severity: 'NOTICE',
          message: `server starts at port ${port}`,
        })
      )
    })
  } catch (err) {
    console.error(
      JSON.stringify({
        severity: 'ALERT',
        // All exceptions that include a stack trace will be
        // integrated with Error Reporting.
        // See https://cloud.google.com/run/docs/error-reporting
        message:
          err instanceof Error && err.stack
            ? 'Error to start server: ' + err.stack
            : new Error('Error to start server').stack,
      })
    )
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
