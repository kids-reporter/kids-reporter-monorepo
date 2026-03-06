import axios from 'axios'

import { formatAxiosError } from '../utils/format-axios-error.js'
import { appendSessionCookie, TokenManager } from './auth.js'

const CMS_REQUEST_TIMEOUT_MS = 5000

export async function callCmsGraphql({
  apiOrigin,
  document,
  variables,
  operationName,
  headers,
  originalCookie,
  mode,
  tokenManager,
  timeoutMs = CMS_REQUEST_TIMEOUT_MS,
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
        headers: { ...customHeaders, 'content-type': 'application/json' },
        timeout: timeoutMs,
      }
    )

  try {
    return await doCall()
  } catch (err) {
    // During Cloud Run scale-up (e.g. 1 → 2 instances), the load balancer may
    // assign one incoming request to the new instance before its startup probe
    // passes. That request is held in a queue until the instance is ready
    // (~20s for Keystone), which exceeds the 5s timeout and triggers an
    // ECONNABORTED error. Subsequent requests go to the existing warm instance
    // and complete normally. Retrying once is therefore very likely to succeed.
    if (axios.isAxiosError(err) && err.code === 'ECONNABORTED') {
      console.warn(
        JSON.stringify({
          severity: 'WARNING',
          message:
            `CMS GraphQL request timed out for operation "${operationName}". ` +
            'Retrying once (likely caused by Cloud Run scale-up queuing).',
        })
      )
      try {
        return await doCall()
      } catch (retryErr) {
        console.error(
          JSON.stringify({
            severity: 'ERROR',
            message:
              `CMS GraphQL retry also failed for operation "${operationName}". ` +
              'Both the initial request and the retry timed out.',
          })
        )
        throw formatAxiosError(retryErr)
      }
    }
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
