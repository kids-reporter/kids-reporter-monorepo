import express from 'express'
import type { DocumentNode } from 'graphql'
export type Operation = {
  method: 'GET' | 'POST'
  cacheTtl?: number
  auth: 'public' | 'auth'
  /**
   * If true, recursively masks any `email` field in successful responses.
   * Used for public idea-hub endpoints that may return member emails.
   */
  maskEmails?: boolean
  operationName: string
  document: DocumentNode
  buildVariables: (input: Record<string, unknown>) => Record<string, unknown>
}

const isRecord = (val: unknown): val is Record<string, unknown> =>
  typeof val === 'object' && val !== null && !Array.isArray(val)

export const ensureRecord = (
  val: unknown,
  errorMessage: string
): Record<string, unknown> => {
  if (!isRecord(val)) {
    throw new Error(errorMessage)
  }
  return val
}

export const ensureArray = (val: unknown, errorMessage: string): unknown[] => {
  if (!Array.isArray(val)) {
    throw new Error(errorMessage)
  }
  return val
}

export const normalizeOrderBy = (
  raw: unknown,
  fallback: unknown[] = []
): unknown[] => {
  if (Array.isArray(raw)) {
    return raw
  }
  if (raw && typeof raw === 'object') {
    return [raw]
  }
  return fallback
}

export const normalizeBoolean = (raw: unknown): boolean => {
  if (typeof raw === 'boolean') {
    return raw
  }
  if (typeof raw === 'number') {
    if (raw === 1) return true
    if (raw === 0) return false
    return false
  }
  if (typeof raw === 'string') {
    const normalized = raw.trim().toLowerCase()
    if (normalized === 'true' || normalized === '1') return true
    if (normalized === 'false' || normalized === '0') return false
  }
  return false
}

export const parseVars = (req: express.Request): Record<string, unknown> => {
  const source = req.method === 'GET' ? req.query : req.body
  const raw = (isRecord(source) ? source.variables : source) ?? {}
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (isRecord(parsed)) {
        return parsed
      }
      throw new Error('Variables must be an object')
    } catch (_err) {
      throw new Error(
        'Invalid JSON in variables: ' +
          (_err instanceof Error ? _err.message : String(_err))
      )
    }
  }
  if (isRecord(raw)) {
    return raw
  }
  throw new Error('Variables must be an object')
}

export const toInt = (val: unknown): number | undefined => {
  const n = Number(val)
  return Number.isFinite(n) ? n : undefined
}
