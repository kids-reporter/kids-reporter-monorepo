import Path from 'node:path'

import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache'
import { createAuth } from '@keystone-6/auth'
import { config } from '@keystone-6/core'
import { statelessSessions } from '@keystone-6/core/session'
import { emitStructured, getTraceLogFields } from '@kids-reporter/logger'
import cors from 'cors'
import express from 'express'

import appConfig from './config'
import { RoleEnum } from './constants/index'
import envVar from './environment-variables'
import { createPreviewMiniApp } from './express-mini-apps/preview/app'
import { twoFactorAuth } from './express-mini-apps/two-factor-auth'
import { extendGraphqlSchema } from './graphql/extend-schema'
import { listDefinition as lists } from './lists/index'
import type { Session } from './types/index'

const sessionDataQuery = 'id name role email twoFactorAuth'

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  sessionData: sessionDataQuery,
  secretField: 'password',
  initFirstItem: {
    // If there are no items in the database, keystone will ask you to create
    // a new user, filling in these fields.
    fields: ['name', 'email', 'password', 'role'],
  },
})

const adminUISession = statelessSessions<Session>(appConfig.session)

const authConfig = withAuth(
  config({
    db: {
      provider: appConfig.database.provider,
      url: appConfig.database.url,
      idField: {
        kind: 'autoincrement',
      },
      // Temporary observability check to confirm PostgreSQL sessions are
      // actually encrypted before Cloud SQL is switched to ENCRYPTED_ONLY.
      // Safe to remove (or trim down to just `encrypted`/`version`) once
      // TLS enforcement has been verified as stable in production.
      onConnect: async (context) => {
        if (appConfig.database.provider !== 'postgresql') {
          return
        }

        const rows = await context.prisma.$queryRaw<
          Array<{ ssl: boolean; version: string | null; cipher: string | null }>
        >`SELECT ssl, version, cipher FROM pg_stat_ssl WHERE pid = pg_backend_pid()`

        const tls = rows[0]

        // Never log DATABASE_URL, credentials, or other full env vars here.
        emitStructured({
          severity: tls?.ssl ? 'INFO' : 'ERROR',
          message: 'PostgreSQL TLS connection status',
          context: {
            encrypted: Boolean(tls?.ssl),
            version: tls?.version ?? undefined,
            cipher: tls?.cipher ?? undefined,
          },
        })
      },
    },
    ui: {
      // For our starter, we check that someone has session data before letting them see the Admin UI.
      isAccessAllowed: (context) => {
        const role = context.session?.data?.role
        return Boolean(role && Object.values(RoleEnum).includes(role))
      },
      // Replace default favicon, ref: https://github.com/keystonejs/keystone/discussions/7506
      getAdditionalFiles: [
        async () => [
          {
            mode: 'copy',
            inputPath: Path.resolve('public/favicon.ico'),
            outputPath: 'public/favicon.ico',
          },
          {
            mode: 'copy',
            inputPath: Path.resolve('public/typing-texting.gif'),
            outputPath: 'public/typing-texting.gif',
          },
          {
            mode: 'copy',
            inputPath: Path.resolve('public/loading.gif'),
            outputPath: 'public/loading.gif',
          },
        ],
      ],
    },
    lists,
    session: adminUISession,
    storage: {
      files: {
        kind: 'local',
        type: 'file',
        storagePath: appConfig.files.storagePath,
        serverRoute: {
          path: '/files',
        },
        generateUrl: (path) => `/files${path}`,
      },
      images: {
        kind: 'local',
        type: 'image',
        storagePath: appConfig.images.storagePath,
        serverRoute: {
          path: '/images',
        },
        generateUrl: (path) => `/images${path}`,
      },
    },
    graphql: {
      apolloConfig: {
        cache: new InMemoryLRUCache({
          // ~100MiB
          maxSize: Math.pow(2, 20) * envVar.memoryCacheSize,
          // 5 minutes (in milliseconds)
          ttl: envVar.memoryCacheTtl,
        }),
      },
      extendGraphqlSchema,
    },
    server: {
      extendExpressApp: (app, commonContext) => {
        app.use((req, res, next) => {
          res.locals.traceLogFields = getTraceLogFields(req.headers)
          next()
        })

        // Health check endpoint for Cloud Run readiness and liveness probes
        app.get('/health', async (req, res) => {
          try {
            // Check database connectivity
            await commonContext.prisma.$queryRaw`SELECT 1`
            res.status(200).json({
              status: 'success',
              timestamp: new Date().toISOString(),
            })
          } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e))
            const traceLogFields = getTraceLogFields(req.headers)
            // Log with stack trace for Error Reporting integration
            emitStructured({
              severity: 'ERROR',
              message: err.stack || err.message,
              ...traceLogFields,
            })
            res.status(503).json({
              status: 'error',
              timestamp: new Date().toISOString(),
              error: 'Database connection failed',
            })
          }
        })

        if (envVar.nodeEnv !== 'production') {
          app.use(
            '/resized',
            express.static(Path.resolve(appConfig.images.storagePath))
          )
        }

        const corsOpts = {
          origin: envVar.cors.allowOrigins,
        }

        emitStructured({
          severity: 'DEBUG',
          message: 'cors allow origins',
          debugPayload: {
            corsOpts,
          },
        })

        const corsMiddleware = cors(corsOpts)

        // enable cors middleware
        app.options('/api/graphql', corsMiddleware)
        app.post('/api/graphql', corsMiddleware)

        // enable 2FA middleware and related routes
        twoFactorAuth(app, commonContext)

        // proxy authenticated requests to preview server
        app.use(
          createPreviewMiniApp({
            previewServer: envVar.previewServer,
            keystoneContext: commonContext,
          })
        )
      },
    },
  })
)

export default authConfig
