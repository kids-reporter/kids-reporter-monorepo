import axios from 'axios'
import consts from './constants.js'
// @ts-ignore `@twreporter/errors` does not have tyepscript definition file yet
import _errors from '@twreporter/errors'
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { GoogleAuth } from 'google-auth-library'

// @twreporter/errors is a cjs module, therefore, we need to use its default property
const errors = _errors.default

const statusCodes = consts.statusCodes

const auth = new GoogleAuth()

class TokenManager {
  // Singleton
  static instance?: TokenManager
  private email: string
  private password: string
  private apiEndpoint: string
  private token: string
  private expiredAt?: number // timestamp
  private iapEnabled: boolean
  private iapAud: string

  constructor(
    email: string,
    password: string,
    apiEndpoint = 'http://localhost:3000/api/graphql',
    iap?: { enabled: boolean; aud: string }
  ) {
    this.email = email
    this.password = password
    this.apiEndpoint = apiEndpoint
    this.token = ''
    this.iapEnabled = iap?.enabled || false
    this.iapAud = iap?.aud || ''

    if (TokenManager.instance) {
      return TokenManager.instance
    }

    TokenManager.instance = this
  }

  /**
   *  This function will return a cache token if token is existed and not expired.
   */
  async getToken() {
    if (this.token && this.expiredAt && this.expiredAt >= Date.now()) {
      return this.token
    }

    // fetch token
    try {
      const sessionToken = await this._fetchToken()
      this.token = sessionToken

      // @TODO expiry time should be returned by API
      // So far, we set expiry time as one hour later
      this.expiredAt = Date.now() + 3600 * 1000

      return this.token
    } catch (err) {
      const annotatedErr = errors.helpers.wrap(
        err,
        'TokenManangerError',
        'Fail to get session token',
        {
          accoutEmail: this.email,
        }
      )
      throw annotatedErr
    }
  }

  /**
   *  This function will return a new token.
   */
  async renewToken() {
    try {
      const sessionToken = await this._fetchToken()
      this.token = sessionToken

      // @TODO expiry time should be returned by API
      // So far, we set expiry time as one hour later
      this.expiredAt = Date.now() + 3600 * 1000
      return this.token
    } catch (err) {
      const annotatedErr = errors.helpers.wrap(
        err,
        'TokenManangerError',
        'Fail to renew session token',
        {
          accoutEmail: this.email,
        }
      )
      throw annotatedErr
    }
  }

  async iapRequest(url: string, body: any): Promise<any> {
    console.info(`request IAP ${url} with target audience ${this.iapAud}`)
    const client = await auth.getIdTokenClient(this.iapAud)
    const res = await client.request({
      url,
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(body),
    })
    return res
  }

  async _fetchToken() {
    const gqlQuery = `
      mutation AuthenticateUserWithPassword($email: String!, $password: String!) {
        authenticateUserWithPassword(email: $email, password: $password) {
          ... on UserAuthenticationWithPasswordSuccess {
            sessionToken
          }
          ... on UserAuthenticationWithPasswordFailure {
            message
          }
        }
      }
    `

    // fetch token
    let axiosRes
    if (this.iapEnabled) {
      axiosRes = await this.iapRequest(this.apiEndpoint, {
        query: gqlQuery,
        variables: {
          email: this.email,
          password: this.password,
        },
      }).catch((err) => {
        throw errors.helpers.annotateAxiosError(err)
      })
    } else {
      try {
        axiosRes = await axios.post(this.apiEndpoint, {
          query: gqlQuery,
          variables: {
            email: this.email,
            password: this.password,
          },
        })
      } catch (err) {
        throw errors.helpers.annotateAxiosError(err)
      }
    }

    const authenticationResult =
      axiosRes.data?.data?.authenticateUserWithPassword
    const errorMessage = authenticationResult?.message
    if (errorMessage) {
      throw new Error(errorMessage)
    }
    const sessionToken = authenticationResult?.sessionToken
    if (!sessionToken) {
      throw new Error(
        'Session token "' + sessionToken + '" is not a valid string'
      )
    }

    return sessionToken
  }
}

/**
 *  This function creates a `GraphQLProxy` mini app.
 *  This mini app aims to add 'keystonejs-session' cookie on incoming requests' header
 *  and proxy them to backed GraphQL API original server.
 */
export function createGraphQLProxy(
  {
    headlessAccount,
    apiOrigin,
  }: {
    headlessAccount: {
      email: string
      password: string
    }
    apiOrigin: string
  },
  iap?: { enabled: boolean; aud: string }
) {
  // create express mini app
  const router = express.Router()

  // enable pre-flight request
  router.options('/api/graphql')

  router.post(
    '/api/graphql',
    async (req, res, next) => {
      console.log(
        JSON.stringify({
          severity: 'DEBUG',
          message:
            'Get session token before proxying requests to backed API original server.',
          ...res?.locals?.globalLogFields,
        })
      )

      try {
        const tokenManager = new TokenManager(
          headlessAccount.email,
          headlessAccount.password,
          apiOrigin + '/api/graphql',
          iap
        )
        const token = await tokenManager.getToken()
        res.locals.sessionToken = token
      } catch (err) {
        console.log(
          JSON.stringify({
            severity: 'ERROR',
            message: errors.helpers.printAll(
              err,
              { withStack: true, withPayload: true },
              0,
              0
            ),
          })
        )
      }
      next()
    },

    // proxy request to API GraphQL endpoint
    createProxyMiddleware({
      target: apiOrigin,
      changeOrigin: true,
      onProxyReq: (proxyReq, req, res) => {
        const token = res.locals.sessionToken
        const originalCookie = req.get('Cookie')
        const cookie = originalCookie
          ? originalCookie + ';keystonejs-session=' + token
          : 'keystonejs-session=' + token

        console.log(
          JSON.stringify({
            severity: 'DEBUG',
            message:
              'Proxy to backed API origin server: ' + apiOrigin + proxyReq.path,
            ...res?.locals?.globalLogFields,
            debugPayload: {
              req: {
                headers: {
                  cookie: cookie,
                  'content-type': 'application/json',
                },
              },
            },
          })
        )
        proxyReq.setHeader('Cookie', cookie)
        proxyReq.setHeader('Content-Type', 'application/json')
        proxyReq.setHeader('x-apollo-operation-name', '')
      },

      onProxyRes: async (proxyRes, req, res) => {
        const statusCode = proxyRes.statusCode

        // renew token if authentication fails
        if (statusCode == 401) {
          console.log(
            JSON.stringify({
              severity: 'DEBUG',
              message: 'Renew session token due to 401 (unauthorized) response',
              ...res?.locals?.globalLogFields,
            })
          )
          try {
            const tokenManager = new TokenManager(
              headlessAccount.email,
              headlessAccount.password,
              apiOrigin + '/api/graphql'
            )
            await tokenManager.renewToken()
          } catch (err) {
            const annotatedErr = errors.helpers.wrap(
              err,
              'GraphQLProxyError',
              'Error to renew session token'
            )
            console.log(
              JSON.stringify({
                severity: 'ERROR',
                message: errors.helpers.printAll(
                  annotatedErr,
                  { withStack: true, withPayload: true },
                  0,
                  0
                ),
              })
            )
          }
        }

        /**
         * Try to fix [memory leak issue](https://github.com/kids-reporter/kids-reporter-monorepo/issues/467).
         * This fix might not work.
         * Need more time to observe the following metrics.
         */
        const cleanup = (err: Error) => {
          console.log('clean up response')
          // cleanup event listeners to allow clean garbage collection
          proxyRes.removeListener('error', cleanup)
          proxyRes.removeListener('close', cleanup)
          res.removeListener('error', cleanup)
          res.removeListener('close', cleanup)

          // destroy all source streams to propagate the caught event backward
          req.destroy(err)
          proxyRes.destroy(err)
        }

        proxyRes.once('error', cleanup)
        proxyRes.once('close', cleanup)
        res.once('error', cleanup)
        res.once('close', cleanup)
      },

      onError: (err, req, res, target) => { // eslint-disable-line
        const annotatedErr = errors.helpers.wrap(
          err,
          'GraphQLProxyError',
          `Error occurs while proxying request to API origin server: ${apiOrigin}` +
            err.message
        )

        console.log(
          JSON.stringify({
            severity: 'ERROR',
            message: errors.helpers.printAll(annotatedErr, {
              withStack: true,
              withPayload: true,
            }),
            ...res?.locals?.globalLogFields,
          })
        )

        res.status(statusCodes.internalServerError).send({
          status: 'error',
          error: annotatedErr.message,
        })
      },
    })
  )

  const errorHandler: express.ErrorRequestHandler = (err, req, res, next) => {
    const annotatedErr = errors.helpers.wrap(
      err,
      'GraphQLProxyError',
      'Unknow error happens when `GraphQLProxy` mini app deals with proxied requests and responses'
    )
    console.log(
      JSON.stringify({
        severity: 'ERROR',
        message: errors.helpers.printAll(err, {
          withStack: true,
          withPayload: true,
        }),
        ...res?.locals?.globalLogFields,
      })
    )

    // Let main application level error handle to deal with the error
    next(annotatedErr)
  }

  router.use(errorHandler)

  return router
}
