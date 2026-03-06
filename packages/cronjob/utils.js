import { IncomingWebhook } from '@slack/webhook'
// @ts-ignore `@twreporter/errors` does not have tyepscript definition file yet
import _errors from '@twreporter/errors'
import axios from 'axios'

import { config } from './configs.js'

// @twreporter/errors is a cjs module, therefore, we need to use its default property
export const errors = _errors.default

/**
 * Format axios errors for consistent logging (aligned with api-gateway).
 * @see packages/api-gateway/src/utils/format-axios-error.ts
 */
export const formatAxiosError = (err) => {
  if (!axios.isAxiosError(err)) {
    return errors.helpers.wrap(
      err,
      err instanceof Error ? err.name : 'UnknownError',
      err instanceof Error ? err.message : String(err)
    )
  }

  let message = 'failed to make an axios request'
  if (err.response) {
    message = `an axios request was made but responded with status ${err.response?.status}`
  } else if (err.request) {
    message = 'an axios request was made but no response was received'
  }

  const axiosError = {
    name: 'AxiosError',
    message,
    code: err.code,
    status: err.response?.status,
    method: err.config?.method,
    url: err.config?.url,
    responseData: err.response?.data,
  }

  return errors.helpers.wrap(undefined, axiosError.name, axiosError.message, {
    axiosError,
  })
}

const sendSlackNotification = async (message) => {
  try {
    const webhook = new IncomingWebhook(config.slackLogHook)
    await webhook.send({
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            emoji: true,
            text: ':information_source:  RSS Cronjob',
          },
        },
        {
          type: 'context',
          elements: [
            {
              text: `*${new Date().toISOString()}*`,
              type: 'mrkdwn',
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message,
          },
        },
      ],
    })
    console.log(
      JSON.stringify({
        severity: 'INFO',
        message: `Slack notification sent: ${message}`,
      })
    )
  } catch (err) {
    errorHandling(err)
  }
}

export const logWithSlack = async (message) => {
  if (config.slackLogHook) {
    await sendSlackNotification(message)
  }
  console.log(
    JSON.stringify({
      severity: 'INFO',
      message,
    })
  )
}

/**
 * Log error and exit (aligned with api-gateway app-level error handler).
 * Wraps unknown errors so all failures have a consistent annotated structure.
 */
export const errorHandling = (err) => {
  const annotatingError = errors.helpers.wrap(
    err,
    'CronjobError',
    'Cronjob failed'
  )
  const entry = {
    severity: 'ERROR',
    // Stack trace integrates with Error Reporting (e.g. Cloud Run).
    message: errors.helpers.printAll(
      annotatingError,
      { withStack: true, withPayload: true },
      0,
      0
    ),
  }
  console.error(JSON.stringify(entry))
  process.exit(1)
}

export class TokenManager {
  static instance

  constructor(email, password, apiEndpoint = config.apiUrl) {
    if (!email || !password || !apiEndpoint) {
      const annotatedErr = errors.helpers.wrap(
        new Error('Email, password, and apiEndpoint are required'),
        'TokenManangerError',
        'Email, password, and apiEndpoint are required'
      )
      throw annotatedErr
    }
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

      //TODO: The API should provide the expiration time, as we have currently configured it to be one hour from the present moment.
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

      //TODO: The API should provide the expiration time, as we have currently configured it to be one hour from the present moment.
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

    let axiosRes
    // fetch token
    try {
      axiosRes = await axios.post(this.apiEndpoint, {
        query: gqlQuery,
        variables: {
          email: this.email,
          password: this.password,
        },
      })
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
      throw new Error(
        'Session token "' + sessionToken + '" is not a valid string'
      )
    }

    return sessionToken
  }
}
