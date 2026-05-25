import type { Prisma } from '@kids-reporter/db'

import envVar from '../environment-variables.js'

export const buildMemberAvatarFileUrl = (avatar: {
  imageFile_id: string | null
  imageFile_extension: string | null
}) => {
  const filename = avatar.imageFile_id
  if (!filename) return ''
  const ext = avatar.imageFile_extension ? `.${avatar.imageFile_extension}` : ''
  return `${envVar.gcs.origin}/images/${filename}${ext}`
}

export function parseOrderByJson(raw: string | undefined): unknown[] {
  if (!raw?.trim()) return []
  try {
    const v = JSON.parse(raw) as unknown
    if (Array.isArray(v)) return v
    if (v && typeof v === 'object') return [v]
  } catch {
    /* ignore */
  }
  return []
}

/** Flat query param for essay-answer lists (replaces JSON `answerOrderBy` arrays). */
export function essayAnswerOrderByFromFlat(
  key: 'createdAt:desc' | 'likesCount:desc'
): Prisma.PostEssayAnswerOrderByWithRelationInput[] {
  if (key === 'likesCount:desc') return [{ likesCount: 'desc' }]
  return [{ createdAt: 'desc' }]
}

export function essayAnswerPrismaOrderBy(
  raw: unknown
): Prisma.PostEssayAnswerOrderByWithRelationInput[] {
  const arr = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object'
      ? [raw]
      : []
  if (!arr.length) return [{ createdAt: 'desc' }]
  return arr.map((o) => {
    if (!o || typeof o !== 'object') return { createdAt: 'desc' }
    const r = o as Record<string, string>
    const out: Prisma.PostEssayAnswerOrderByWithRelationInput = {}
    if (r.createdAt === 'asc' || r.createdAt === 'desc')
      out.createdAt = r.createdAt
    if (r.id === 'asc' || r.id === 'desc') out.id = r.id
    if (r.updatedAt === 'asc' || r.updatedAt === 'desc')
      out.updatedAt = r.updatedAt
    if (r.likesCount === 'asc' || r.likesCount === 'desc')
      out.likesCount = r.likesCount
    return Object.keys(out).length ? out : { createdAt: 'desc' }
  })
}

export function connectIdFromCreateData(
  data: Record<string, unknown>,
  field: string
): number | null {
  const rel = data[field] as Record<string, unknown> | undefined
  const connect = rel?.connect as Record<string, unknown> | undefined
  const id = connect?.id
  if (id == null) return null
  const n = Number(id)
  return Number.isFinite(n) ? n : null
}

type ChoiceOption = { content?: unknown; isCorrectAnswer?: unknown }

export async function computeChoiceCorrect(
  tx: Prisma.TransactionClient,
  questionId: number,
  choiceIndex: number
): Promise<boolean> {
  const q = await tx.postChoiceQuestion.findUnique({
    where: { id: questionId },
    select: { options: true },
  })
  const opts = (q?.options as ChoiceOption[] | null) ?? []
  const correctIndex = opts.findIndex((o) => !!o?.isCorrectAnswer)
  return choiceIndex === correctIndex
}
