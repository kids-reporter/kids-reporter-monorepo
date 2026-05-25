/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { NormalizedTraceContext } from '@kids-reporter/logger'

declare global {
  namespace Express {
    interface Locals {
      globalLogFields?: { 'logging.googleapis.com/trace'?: string }
      traceContext?: NormalizedTraceContext
    }

    interface Request {
      /** go-api JWT `user_id` claim (stringified), set after Bearer verification. */
      goApiJwtUserId?: string
    }
  }
}

export {}
