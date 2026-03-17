import axios from 'axios'

import envVars from '../environment-variables.js'
import { formatAxiosError } from '../utils/format-axios-error.js'
import { appendSessionCookie, TokenManager } from './auth.js'

export async function callCmsGraphql({
  apiOrigin,
  document,
  variables,
  operationName,
  headers,
  originalCookie,
  mode,
  tokenManager,
  timeoutMs = envVars.apis.requestTimeoutMs,
}: {
  apiOrigin: string
  document: string
  variables: Record<string, unknown>
  operationName: string
  headers: Record<string, string>
  originalCookie?: string
  mode: 'jwt' | 'cookie'
  tokenManager?: TokenManager
  timeoutMs?: number
}) {
  const endpoint = `${apiOrigin}/api/graphql`
  const doCall = async (customHeaders = headers) =>
    axios.post(
      endpoint,
      { query: document, variables, operationName },
      {
        headers: {
          ...customHeaders,
          'content-type': 'application/json',
        },
        timeout: timeoutMs,
      }
    )

  try {
    return await doCall()
  } catch (err) {
    if (
      mode === 'cookie' &&
      axios.isAxiosError(err) &&
      err.response?.status === 401 &&
      tokenManager
    ) {
      try {
        const token = await tokenManager.renewToken()
        // Retry with the refreshed headless token stitched back into the Cookie header
        const refreshedHeaders = {
          ...headers,
          Cookie: appendSessionCookie(originalCookie || '', token),
        }
        return await doCall(refreshedHeaders)
      } catch (retryErr) {
        throw formatAxiosError(retryErr)
      }
    }
    throw formatAxiosError(err)
  }
}
