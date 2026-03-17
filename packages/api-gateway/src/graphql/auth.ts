import { normalizeTraceContext } from '@kids-reporter/logger'
import axios from 'axios'
import express from 'express'

import { formatAxiosError } from '../utils/format-axios-error.js'

const TOKEN_EXPIRY_MS = 3600 * 1000 // 1 hour

export class TokenManager {
  // Singleton
  static instance?: TokenManager
  private email: string
  private password: string
  private apiEndpoint: string
  private token: string
  private expiredAt?: number // timestamp
  private renewPromise?: Promise<string>

  constructor(
    email: string,
    password: string,
    apiEndpoint = 'http://localhost:3000/api/graphql'
  ) {
    this.email = email
    this.password = password
    this.apiEndpoint = apiEndpoint
    this.token = ''

    if (TokenManager.instance) {
      return TokenManager.instance
    }

    TokenManager.instance = this
  }

  /**
   *  This function will return a cached token if a token exists and is not expired.
   */
  async getToken() {
    if (this.token && this.expiredAt && this.expiredAt >= Date.now()) {
      return this.token
    }

    return this.queueRenewal()
  }

  /**
   *  This function will return a new token.
   */
  async renewToken() {
    this.token = ''
    this.expiredAt = undefined
    return this.queueRenewal()
  }

  private async queueRenewal() {
    if (!this.renewPromise) {
      this.renewPromise = this.fetchToken().finally(() => {
        this.renewPromise = undefined
      })
    }
    return this.renewPromise
  }

  private async fetchToken() {
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

    // Use a fresh trace for the singleton token renewal so concurrent requests
    // don't attribute this auth request to the wrong trace.
    const traceHeaders = normalizeTraceContext(undefined, {
      generateIfMissing: true,
    }).traceHeaders

    let axiosRes
    // fetch token
    try {
      axiosRes = await axios.post(
        this.apiEndpoint,
        {
          query: gqlQuery,
          variables: {
            email: this.email,
            password: this.password,
          },
        },
        {
          headers: traceHeaders,
        }
      )
    } catch (err) {
      throw formatAxiosError(err)
    }

    const authenticationResult =
      axiosRes.data?.data?.authenticateUserWithPassword
    const errorMessage = authenticationResult?.message
    if (errorMessage) {
      throw new Error(errorMessage)
    }

    const sessionToken = authenticationResult?.sessionToken
    if (!sessionToken) {
      throw new Error('Session token is missing or invalid')
    }

    this.token = sessionToken
    // @TODO expiry time should be returned by API
    // So far, we set expiry time as one hour later
    this.expiredAt = Date.now() + TOKEN_EXPIRY_MS
    return this.token
  }
}

export const isBearerAuth = (req: express.Request) => {
  const auth = req.get('authorization') || ''
  return auth.startsWith('Bearer ')
}

export async function buildAuthContext({
  req,
  apiOrigin,
  headlessAccount,
  auth,
}: {
  req: express.Request
  apiOrigin: string
  headlessAccount: { email: string; password: string }
  auth: 'auth' | 'public'
}): Promise<{
  mode: 'jwt' | 'cookie'
  headers: Record<string, string>
  originalCookie?: string
  tokenManager?: TokenManager
}> {
  const traceHeaders =
    normalizeTraceContext(req.headers, {
      generateIfMissing: true,
    })?.traceHeaders || {}

  if (auth === 'auth') {
    const authorization = req.get('authorization') || ''
    if (!authorization) {
      throw new Error('Authorization header is required')
    }
    return {
      mode: 'jwt',
      headers: {
        Authorization: authorization,
        ...traceHeaders,
      },
    }
  }

  const tokenManager = new TokenManager(
    headlessAccount.email,
    headlessAccount.password,
    apiOrigin + '/api/graphql'
  )
  const token = await tokenManager.getToken()
  const originalCookie = req.get('Cookie') || ''
  // Preserve client cookies while adding/refreshing the headless session token
  const cookie = appendSessionCookie(originalCookie, token)

  return {
    mode: 'cookie',
    headers: {
      Cookie: cookie,
      ...traceHeaders,
    },
    originalCookie,
    tokenManager,
  }
}

export const appendSessionCookie = (originalCookie: string, token: string) =>
  originalCookie
    ? `${originalCookie};keystonejs-session=${token}`
    : `keystonejs-session=${token}`
