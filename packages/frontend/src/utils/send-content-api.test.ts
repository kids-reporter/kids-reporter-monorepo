import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import envVars from '@/environment-variables'

import {
  ContentApiRequestError,
  sendContentApiRequest,
} from './send-content-api'

vi.mock('@kids-reporter/logger', () => ({
  emitStructured: vi.fn(),
  normalizeTraceContext: () => ({
    traceId: 'abc',
    traceHeaders: {},
  }),
}))

vi.mock('@/environment-variables', () => ({
  default: { requestTimeoutMs: 10_000 },
}))

vi.mock('@/constants', () => ({
  CONTENT_API_ORIGIN: 'https://content.example',
  INTERNAL_CONTENT_API_ORIGIN: 'http://content.internal',
}))

function httpError(status?: number): AxiosError {
  const error = new AxiosError(
    'fail',
    status === undefined ? 'ECONNABORTED' : 'ERR_BAD_RESPONSE'
  )
  if (status !== undefined) {
    error.response = {
      status,
      data: {},
      headers: {},
      statusText: '',
      config: {} as InternalAxiosRequestConfig,
    }
  }
  return error
}

describe('sendContentApiRequest server GET retries', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    envVars.requestTimeoutMs = 10_000
    vi.spyOn(Math, 'random').mockReturnValue(0)
    vi.spyOn(axios, 'request')
    vi.unstubAllGlobals()
  })

  it('retries a 503 once and returns the next success', async () => {
    vi.mocked(axios.request)
      .mockRejectedValueOnce(httpError(503))
      .mockResolvedValueOnce({
        data: { ok: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      })

    await expect(sendContentApiRequest({ path: '/v1/posts' })).resolves.toEqual(
      {
        ok: true,
      }
    )
    expect(axios.request).toHaveBeenCalledTimes(2)
  })

  it('stops after three 500s', async () => {
    vi.mocked(axios.request).mockRejectedValue(httpError(500))

    await expect(
      sendContentApiRequest({ path: '/v1/posts' })
    ).rejects.toBeInstanceOf(ContentApiRequestError)
    expect(axios.request).toHaveBeenCalledTimes(3)
  })

  it('does not retry 404 or 400', async () => {
    vi.mocked(axios.request).mockRejectedValueOnce(httpError(404))
    await expect(
      sendContentApiRequest({ path: '/v1/posts' })
    ).rejects.toBeInstanceOf(ContentApiRequestError)

    vi.mocked(axios.request).mockRejectedValueOnce(httpError(400))
    await expect(
      sendContentApiRequest({ path: '/v1/posts' })
    ).rejects.toBeInstanceOf(ContentApiRequestError)
    expect(axios.request).toHaveBeenCalledTimes(2)
  })

  it('does not retry POST', async () => {
    vi.mocked(axios.request).mockRejectedValueOnce(httpError(503))
    await expect(
      sendContentApiRequest({ path: '/v1/posts', method: 'POST', body: {} })
    ).rejects.toBeInstanceOf(ContentApiRequestError)
    expect(axios.request).toHaveBeenCalledTimes(1)
  })

  it('does not retry in the browser', async () => {
    vi.stubGlobal('window', {})
    vi.mocked(axios.request).mockRejectedValueOnce(httpError(503))
    await expect(
      sendContentApiRequest({ path: '/v1/posts' })
    ).rejects.toBeInstanceOf(ContentApiRequestError)
    expect(axios.request).toHaveBeenCalledTimes(1)
  })

  it('caps a zero request timeout at the server GET deadline', async () => {
    envVars.requestTimeoutMs = 0
    let now = 1_000_000
    vi.spyOn(Date, 'now').mockImplementation(() => now)
    vi.mocked(axios.request).mockImplementation(async () => {
      now += 20_000
      throw httpError()
    })

    await expect(
      sendContentApiRequest({ path: '/v1/posts' })
    ).rejects.toBeInstanceOf(ContentApiRequestError)
    expect(axios.request).toHaveBeenCalledTimes(1)
    expect(vi.mocked(axios.request).mock.calls[0]?.[0]?.timeout).toBe(20_000)
  })

  it('does not start another attempt after a hung timeout uses the deadline', async () => {
    let now = 1_000_000
    vi.spyOn(Date, 'now').mockImplementation(() => now)
    vi.mocked(axios.request).mockImplementation(async () => {
      now += 10_000
      throw httpError()
    })

    await expect(
      sendContentApiRequest({ path: '/v1/posts' })
    ).rejects.toBeInstanceOf(ContentApiRequestError)
    expect(axios.request).toHaveBeenCalledTimes(1)
    expect(vi.mocked(axios.request).mock.calls[0]?.[0]?.timeout).toBe(10_000)
  })

  it('aborts during backoff and does not send another request', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    vi.mocked(axios.request).mockRejectedValueOnce(httpError(503))
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 20)

    await expect(
      sendContentApiRequest({ path: '/v1/posts', signal: controller.signal })
    ).rejects.toBeInstanceOf(ContentApiRequestError)
    expect(axios.request).toHaveBeenCalledTimes(1)
  })
})
