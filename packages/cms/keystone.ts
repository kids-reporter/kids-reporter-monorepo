import Path from 'node:path'

import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache'
import { createAuth } from '@keystone-6/auth'
import { config } from '@keystone-6/core'
import { statelessSessions } from '@keystone-6/core/session'
import type { SessionStrategy } from '@keystone-6/core/types'
import { emitStructured, getTraceLogFields } from '@kids-reporter/logger'
import cors from 'cors'
import express from 'express'
import jwt from 'jsonwebtoken'

import appConfig from './config'
import { RoleEnum } from './constants/index'
import envVar from './environment-variables'
import { createPreviewMiniApp } from './express-mini-apps/preview/app'
import { twoFactorAuth } from './express-mini-apps/two-factor-auth'
import { extendGraphqlSchema } from './graphql/extend-schema'
import { listDefinition as lists } from './lists/index'
import type { AdminSession, Context, Session, TypeInfo } from './types/index'

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

/**
 *  Existing Keystone cookie-based session: used for Admin login/logout
 */
const adminUISession = statelessSessions<Session>(appConfig.session)

/**
 *  Generate Keystone Session from an external JWT
 *    - Extract token from Authorization: Bearer <token>
 *    - Verify signature + iss/aud/exp
 *    - Map to a Keystone Member itemId (if not found, either create a new one or reject)
 */
async function getSessionFromGoApiJwt({
  context,
}: {
  context: Context
}): Promise<Session | undefined> {
  const req = context.req
  if (!req) {
    return
  }

  const auth = req.headers['authorization'] as string | undefined

  if (!auth?.startsWith('Bearer ')) {
    return
  }

  const token = auth.slice('Bearer '.length)

  if (!token) {
    return
  }

  let decoded

  try {
    decoded = jwt.verify(token, envVar.goApiJwt.secret, {
      algorithms: ['HS256'],
      ignoreNotBefore: true,
    }) as jwt.JwtPayload
    // extra claims validation
    if (decoded.iss !== envVar.goApiJwt.issuer) {
      throw new Error(`Invalid issuer: ${decoded.iss}`)
    }
    if (!decoded.user_id) {
      throw new Error(`Missing identity claim`)
    }
    if (decoded.aud !== envVar.goApiJwt.audience) {
      throw new Error(`Invalid audience: ${decoded.aud}`)
    }
  } catch (err) {
    const traceLogFields = getTraceLogFields(req.headers)
    emitStructured({
      severity: 'INFO',
      message:
        'Authorization Bearer token is invalid. ' +
        (err instanceof Error ? err.message : 'Invalid JWT'),
      context: {
        function: 'getSessionFromGoApiJwt',
      },
      ...traceLogFields,
    })

    // JWT verification fails, treat it as no session
    return
  }

  let member
  try {
    member = await context.prisma.member.findUnique({
      where: {
        twreporter_user_id: `${decoded.user_id}`,
      },
      select: {
        id: true,
        twreporter_user_id: true,
        email: true,
      },
    })

    if (!member) {
      const data = {
        email: decoded.email,
        twreporter_user_id: `${decoded.user_id}`,
      }
      member = await context.prisma.member.create({
        data,
        select: {
          id: true,
          twreporter_user_id: true,
          email: true,
        },
      })
    }
  } catch (_err) {
    const err = _err instanceof Error ? _err : new Error(String(_err))
    const traceLogFields = getTraceLogFields(req.headers)

    emitStructured({
      severity: 'ERROR',
      context: {
        twreporter_user_id: decoded.user_id,
        email: decoded.email,
      },
      message: err.stack, // trigger error reporting
      ...traceLogFields,
    })

    // JWT verification fails, treat it as no session
    return
  }

  /**
   *  Return a session object expected by Keystone
   *    ⚠️ Important:
   *    - Admin UI session authentication maps to listKey: 'User'
   *    - External JWT auth maps to listKey: 'Member'
   *      → Make sure the listKey corresponds to the correct list
   *        depending on the authentication source
   */
  return {
    listKey: 'Member',
    itemId: member.id,
    data: {
      memberId: member.id,
      twreporterUserId: member.twreporter_user_id,
      role: RoleEnum.Member,

      // bypass two-factor authentication
      twoFactorAuth: {
        bypass: true,
      },
    },
  }
}
/**
 *  Composite strategy:
 *    - get(): try Admin UI session first, if not found then try external JWT
 *    - start/end: delegate directly to Admin UI session (Admin login/logout)
 */
const compositeSession: SessionStrategy<Session, TypeInfo> = {
  async get({ context }) {
    // First, try Admin UI session
    let session = (await adminUISession.get({ context })) as AdminSession

    if (session) {
      const sudoContext = context.sudo()

      const { listKey, itemId } = session

      if (!listKey || !itemId) {
        return
      }

      try {
        const data = await sudoContext.query[listKey].findOne({
          where: { id: itemId },
          query: sessionDataQuery,
        })

        if (!data) {
          return
        }

        return {
          listKey,
          itemId,
          data,
        }
      } catch (_err) {
        const err = _err instanceof Error ? _err : new Error(String(_err))
        const traceLogFields = getTraceLogFields(context.req?.headers)

        emitStructured({
          severity: 'ERROR',
          context: {
            listKey,
            itemId,
          },
          message: err.stack, // trigger error reporting
          ...traceLogFields,
        })
        return
      }
    }

    // Then try external JWT
    return await getSessionFromGoApiJwt({ context })
  },
  async start({ context, data }) {
    // Only Admin login calls this: this will set keystonejs-session cookie
    return adminUISession.start({ context, data })
  },
  async end({ context }) {
    // Only Admin logout calls this: this will unset keystonejs-session cookie
    return adminUISession.end({ context })
  },
}

const authConfig = withAuth(
  config({
    db: {
      provider: appConfig.database.provider,
      url: appConfig.database.url,
      idField: {
        kind: 'autoincrement',
      },
    },
    ui: {
      // If `isDisabled` is set to `true` then the Admin UI will be completely disabled.
      isDisabled: envVar.isUIDisabled,
      // For our starter, we check that someone has session data before letting them see the Admin UI.
      isAccessAllowed: (context) => {
        // Member role has no permission to access Admin UI.
        return (
          context.session?.data && context.session.data.role !== RoleEnum.Member
        )
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

/**
 * ⚠️  Note:
 * `withAuth` overrides the return value of the session strategy
 * and only recognizes the `listKey: 'User'` defined in `createAuth`.
 * Any other return value (e.g. `{ listKey: 'Member', ... }`) would be
 * replaced with `undefined`.
 *
 * To preserve the compositeSession config, it must be assigned directly
 * to `authConfig.session` instead of passing it through `withAuth`.
 */
authConfig.session = compositeSession

export default authConfig
