/* eslint-disable @typescript-eslint/consistent-type-definitions */
declare module 'http' {
  interface ServerResponse {
    locals?: {
      traceLogFields?: Record<string, unknown>
    }
  }
}
