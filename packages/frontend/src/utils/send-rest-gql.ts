import { emitStructured } from '@kids-reporter/logger'
import errors from '@twreporter/errors'
import axios, { AxiosResponse } from 'axios'

import { INTERNAL_REST_GQL_ENDPOINT, REST_GQL_ENDPOINT } from '@/constants'
import envVars from '@/environment-variables'

import { buildTraceHeaders } from './trace-context'

type GraphQLResponse<TData = Record<string, unknown>> = {
  data?: TData
  errors?: Array<{ message: string }>
}

export async function sendRestGqlRequest<TData = Record<string, unknown>>({
  operation,
  method,
  variables,
  authToken,
  signal,
  traceHeaders,
}: {
  operation: string
  method: 'GET' | 'POST'
  variables?: Record<string, unknown>
  authToken?: string
  signal?: AbortSignal
  traceHeaders?: Headers | Record<string, string | undefined>
}) {
  let url
  if (typeof window === 'undefined') {
    url = `${INTERNAL_REST_GQL_ENDPOINT}/${operation}`
  } else {
    url = `${REST_GQL_ENDPOINT}/${operation}`
  }

  let response: AxiosResponse<GraphQLResponse<TData>> | undefined
  try {
    const config = {
      headers: {
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...buildTraceHeaders(traceHeaders),
      },
      timeout: envVars.requestTimeoutMs,
      withCredentials: true,
      signal,
    }

    if (method === 'GET') {
      response = await axios.get<GraphQLResponse<TData>>(url, {
        ...config,
        params: {
          variables: JSON.stringify(variables ?? {}),
        },
      })
    } else {
      response = await axios.post<GraphQLResponse<TData>>(
        url,
        { variables },
        config
      )
    }
  } catch (err) {
    const annotatedErr = errors.helpers.annotateAxiosError(err)
    emitStructured({
      severity: 'ERROR',
      message: errors.helpers.printAll(annotatedErr, {
        withStack: true,
        withPayload: true,
      }),
    })
  }

  const gqlErrors = response?.data?.errors
  if (gqlErrors) {
    const annotatedErr = errors.helpers.wrap(
      new Error(
        `Errors occurred while executing REST GQL operation: ${operation}`
      ),
      'GraphQLError',
      'Errors occurred after axios request',
      { errors: gqlErrors }
    )
    emitStructured({
      severity: 'ERROR',
      message: errors.helpers.printAll(annotatedErr, {
        withStack: true,
        withPayload: true,
      }),
    })
  }

  return response
}
