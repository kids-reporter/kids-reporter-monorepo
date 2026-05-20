import { Prisma, PrismaClient } from '@prisma/client'

declare global {
  var __kidsReporterPrisma: PrismaClient | undefined
}

export type { PrismaClient } from '@prisma/client'
export { Prisma } from '@prisma/client'

const parsePrismaLog = (
  raw: string | undefined
): Prisma.PrismaClientOptions['log'] | undefined => {
  if (!raw) return undefined
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const allowed = new Set<string>(['query', 'info', 'warn', 'error'])

  const levels = parts.filter((p): p is Prisma.LogLevel => allowed.has(p))

  return levels.length ? levels : undefined
}

export const prisma =
  globalThis.__kidsReporterPrisma ??
  new PrismaClient({
    log: parsePrismaLog(process.env.PRISMA_LOG_LEVEL),
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__kidsReporterPrisma = prisma
}
