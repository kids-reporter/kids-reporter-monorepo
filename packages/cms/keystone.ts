import Path from 'node:path'
import cors from 'cors'
import { config } from '@keystone-6/core'
import { listDefinition as lists } from './lists'
import appConfig from './config'
import envVar from './environment-variables'
import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { createAuth } from '@keystone-6/auth'
import { statelessSessions } from '@keystone-6/core/session'
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache'
import { createPreviewMiniApp } from './express-mini-apps/preview/app'
import { twoFactorAuth } from './express-mini-apps/two-factor-auth'
import type { TypedKeystoneContext } from './types/context'

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  sessionData: 'id name role email twoFactorAuth',
  secretField: 'password',
  initFirstItem: {
    // If there are no items in the database, keystone will ask you to create
    // a new user, filling in these fields.
    fields: ['name', 'email', 'password', 'role'],
  },
})

const session = statelessSessions(appConfig.session)

export default withAuth(
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
      isAccessAllowed: (context) => !!context.session?.data,
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
    session,
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
    },
    server: {
      healthCheck: {
        path: '/health_check',
        data: { status: 'healthy' },
      },
      extendExpressApp: (app, commonContext) => {
        const corsOpts = {
          origin: envVar.cors.allowOrigins,
        }

        console.log(
          JSON.stringify({
            severity: 'DEBUG',
            message: 'cors allow origins',
            debugPayload: {
              corsOpts,
            },
          })
        )

        const corsMiddleware = cors(corsOpts)

        // Check if the request is sent by an authenticated user
        const authenticationMw = async (
          req: Request,
          res: Response,
          next: NextFunction
        ) => {
          const context = await commonContext.withRequest(req, res)
          const token = req?.cookies?.['keystonejs-session']

          // User has been logged in
          if (context?.session?.data?.role) {
            return next()
          }

          if (token) {
            res.status(401).json({
              status: 'fail',
              data: 'Authentication fails due to session cookie is not valid.',
            })
          }

          return next()
        }

        /**
         * Middleware: Verify JWT and provision member if needed.
         *
         * 1. Check if the request contains an Authorization header with the format `Bearer <token>`.
         * 2. Verify the JWT using HS256 and the configured secret.
         * 3. Ensure the decoded token contains a valid `user_id`.
         * 4. Query the local database for an existing member record with the given `user_id`.
         *    - If not found, create a new member record using `email` and `user_id` from the token.
         * 5. Attach the member data to the session context for downstream resolvers/middleware.
         *
         * Note: This middleware only runs when an Authorization header is present.
         */
        const jwtVerifyAndProvisionMember = async (
          req: Request,
          res: Response,
          next: NextFunction
        ) => {
          const context: TypedKeystoneContext = await commonContext.withRequest(
            req,
            res
          )
          const auth = req.headers.authorization || ''
          const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
          if (token) {
            const decoded = jwt.verify(token, envVar.twreporterJWTSecret, {
              algorithms: ['HS256'],
              ignoreNotBefore: true,
            }) as jwt.JwtPayload

            if (!decoded || !decoded.user_id) {
              return res.status(401).json({
                status: 'fail',
                data: 'Unauthorized due to invalid access token.',
              })
            }

            try {
              let member = await context.prisma.member.findUnique({
                where: {
                  twreporter_user_id: `${decoded.user_id}`,
                },
                select: {
                  id: true,
                  twreporter_user_id: true,
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
                  },
                })

                context.session.data.member = member
              }
            } catch (err) {
              // @TODO error reporting
              console.error(err)
            }
          }

          return next()
        }

        // enable cors and authentication middlewares
        app.options('/api/graphql', authenticationMw, corsMiddleware)
        app.post(
          '/api/graphql',
          authenticationMw,
          jwtVerifyAndProvisionMember,
          corsMiddleware
        )

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
