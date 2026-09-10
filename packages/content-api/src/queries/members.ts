import { randomUUID } from 'node:crypto'
import { mkdir, rename, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type {
  MemberProfile,
  MemberProfilePatch,
} from '@kids-reporter/api-types'
import { Prisma, prisma } from '@kids-reporter/db'

import envVar from '../environment-variables.js'
import { buildMemberAvatarFileUrl } from '../utils/qna-utils.js'

const memberSelect = {
  id: true,
  name: true,
  email: true,
  nickname: true,
  contactEmail: true,
  birthday: true,
  locationCountry: true,
  locationRegion: true,
  identity: true,
  twreporter_user_id: true,
  showBaodaozai: true,
  essayQuestionCount: true,
  createdAt: true,
  avatar: {
    select: {
      id: true,
      imageFile_id: true,
      imageFile_extension: true,
    },
  },
} as const

type MemberIdentity = NonNullable<MemberProfile['identity']>
type MemberLocationCountry = NonNullable<MemberProfile['locationCountry']>

type MemberRow = {
  id: string
  name: string
  email: string
  nickname: string
  contactEmail: string
  birthday: Date | null
  locationCountry: string | null
  locationRegion: string | null
  identity: string | null
  twreporter_user_id: string
  showBaodaozai: boolean
  essayQuestionCount: number | null
  createdAt: Date | null
  avatar: {
    id: number
    imageFile_id: string | null
    imageFile_extension: string | null
  } | null
}

const EMPTY_TO_NULL = (value: string | null | undefined): string | null => {
  if (!value) return null
  return value
}

const toCalendarDay = (value: Date | null): string | null => {
  if (!value) return null
  return value.toISOString().slice(0, 10)
}

const parseIdentity = (value: string | null): MemberIdentity | null => {
  if (
    value === 'student' ||
    value === 'parent' ||
    value === 'teacher' ||
    value === 'public'
  ) {
    return value
  }
  return null
}

const parseLocationCountry = (
  value: string | null
): MemberLocationCountry | null => {
  if (value === 'taiwan' || value === 'other') {
    return value
  }
  return null
}

const mapMember = (m: MemberRow): MemberProfile => ({
  id: m.id,
  name: m.name,
  email: m.email,
  nickname: m.nickname,
  contactEmail: m.contactEmail,
  birthday: toCalendarDay(m.birthday),
  locationCountry: parseLocationCountry(EMPTY_TO_NULL(m.locationCountry)),
  locationRegion: EMPTY_TO_NULL(m.locationRegion),
  identity: parseIdentity(EMPTY_TO_NULL(m.identity)),
  twreporter_user_id: m.twreporter_user_id,
  showBaodaozai: m.showBaodaozai,
  essayQuestionCount: m.essayQuestionCount,
  createdAt: m.createdAt ? m.createdAt.toISOString() : null,
  avatar: m.avatar
    ? {
        id: String(m.avatar.id),
        fileUrl: buildMemberAvatarFileUrl(m.avatar),
      }
    : null,
})

/** Used by `GET /v1/members/me`. */
export async function findMemberProfile(
  userId: string
): Promise<MemberProfile | null> {
  const member = await prisma.member.findUnique({
    where: { twreporter_user_id: userId },
    select: memberSelect,
  })
  return member ? mapMember(member as MemberRow) : null
}

/** Used by handlers that only need `{ id, role }` and a 404/403 short-circuit. */
export async function findMemberIdRole(
  userId: string
): Promise<{ id: string; role: string | null } | null> {
  const m = await prisma.member.findUnique({
    where: { twreporter_user_id: userId },
    select: { id: true, role: true },
  })
  return m ?? null
}

const toPrismaMemberPatch = (
  data: MemberProfilePatch
): Prisma.MemberUpdateInput => {
  const patch: Prisma.MemberUpdateInput = { ...data }
  if ('birthday' in data) {
    patch.birthday =
      data.birthday === null || data.birthday === undefined
        ? null
        : new Date(`${data.birthday}T00:00:00.000Z`)
  }
  if ('locationCountry' in data) {
    patch.locationCountry = data.locationCountry ?? null
  }
  if ('locationRegion' in data) {
    patch.locationRegion = data.locationRegion ?? null
  }
  if ('identity' in data) {
    patch.identity = data.identity ?? null
  }
  return patch
}

/**
 * `PATCH /v1/members/me`. Returns `null` when the member does not exist;
 * routes should map that to 404 (matching prior behavior).
 */
export async function updateMemberProfile(
  userId: string,
  data: MemberProfilePatch
): Promise<MemberProfile | null> {
  try {
    const updated = await prisma.member.update({
      where: { twreporter_user_id: userId },
      data: toPrismaMemberPatch(data),
      select: memberSelect,
    })
    return mapMember(updated as MemberRow)
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2025'
    ) {
      return null
    }
    throw e
  }
}

// --- Avatar (DB transaction colocated with FS unlink) ---

export const MEMBER_AVATAR_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
])

export const extForMemberAvatarMime = (m: string) => {
  if (m === 'image/jpeg' || m === 'image/jpg') return 'jpg'
  if (m === 'image/png') return 'png'
  if (m === 'image/gif') return 'gif'
  if (m === 'image/webp') return 'webp'
  return 'bin'
}

const buildAvatarRelName = (avatar: {
  imageFile_id: string | null
  imageFile_extension: string | null
}) => {
  if (!avatar.imageFile_id) return null
  return `${avatar.imageFile_id}${
    avatar.imageFile_extension ? `.${avatar.imageFile_extension}` : ''
  }`
}

const resolveAvatarPaths = (avatar: {
  imageFile_id: string | null
  imageFile_extension: string | null
}) => {
  const base = envVar.images.storagePath
  const rel = buildAvatarRelName(avatar)
  if (!base || !rel) return null
  const imagesDir = path.join(base, 'images')
  return { imagesDir, rel, fullPath: path.join(imagesDir, rel) }
}

const tryUnlinkAvatarFile = async (avatar: {
  imageFile_id: string | null
  imageFile_extension: string | null
}) => {
  const resolved = resolveAvatarPaths(avatar)
  if (!resolved) return
  try {
    await unlink(resolved.fullPath)
  } catch {
    /* ignore missing file */
  }
}

export type FindMemberAvatarStateResult =
  | {
      kind: 'ok'
      member: { id: string; role: string | null; avatarId: number | null }
    }
  | { kind: 'not_found' }
  | { kind: 'forbidden' }

/** Used before avatar upload; consolidates auth lookup + role check. */
export async function findMemberForAvatarUpload(
  userId: string
): Promise<FindMemberAvatarStateResult> {
  const member = await prisma.member.findUnique({
    where: { twreporter_user_id: userId },
    select: { id: true, role: true, avatarId: true },
  })
  if (!member) return { kind: 'not_found' }
  if (member.role !== 'member' && member.role !== 'admin') {
    return { kind: 'forbidden' }
  }
  return { kind: 'ok', member }
}

export type ReplaceMemberAvatarInput = {
  memberId: string
  prevAvatarId: number | null
  fileBuffer: Buffer
  fileSize: number
  mime: string
  uploadName: string
}

/**
 * Replace a member's avatar without making DB+FS inconsistent:
 * - Write to a temp file
 * - Create the new DB row
 * - Move the file into its final location
 * - Transactionally point the member at it and delete the old row
 * - Unlink the old file after the transaction commits
 */
export async function replaceMemberAvatar(
  input: ReplaceMemberAvatarInput
): Promise<{ id: string; name: string }> {
  const ext = extForMemberAvatarMime(input.mime)
  const imageFile_id = randomUUID().replace(/-/g, '')
  const base = envVar.images.storagePath
  const resolved = resolveAvatarPaths({
    imageFile_id,
    imageFile_extension: ext,
  })
  if (!base || !resolved) {
    throw new Error('Images storage is not configured')
  }

  await mkdir(resolved.imagesDir, { recursive: true })

  // Write to a temp file first; only move into place after DB commits.
  const tmpName = `.tmp-${randomUUID().replace(/-/g, '')}-${imageFile_id}.${ext}`
  const tmpPath = path.join(resolved.imagesDir, tmpName)

  await writeFile(tmpPath, input.fileBuffer)

  let createdRow: { id: number; name: string } | null = null
  try {
    // Phase 1: create the new avatar row only (no member update, no old deletion).
    createdRow = await prisma.memberAvatar.create({
      data: {
        name: input.uploadName,
        imageFile_id,
        imageFile_extension: ext,
        imageFile_filesize: input.fileSize,
      },
      select: { id: true, name: true },
    })

    // Phase 2: move file into its final location.
    await rename(tmpPath, resolved.fullPath)

    // Phase 3: transactionally point member at the new avatar and delete old row.
    let oldForUnlink: {
      imageFile_id: string | null
      imageFile_extension: string | null
    } | null = null

    await prisma.$transaction(async (tx) => {
      if (input.prevAvatarId) {
        oldForUnlink = await tx.memberAvatar.findUnique({
          where: { id: input.prevAvatarId },
          select: { imageFile_id: true, imageFile_extension: true },
        })
      }

      await tx.member.update({
        where: { id: input.memberId },
        data: { avatarId: createdRow!.id },
      })

      if (input.prevAvatarId) {
        await tx.memberAvatar.delete({ where: { id: input.prevAvatarId } })
      }
    })

    // Only unlink the old file after the DB transaction succeeds.
    if (oldForUnlink) {
      await tryUnlinkAvatarFile(oldForUnlink)
    }

    return { id: String(createdRow.id), name: createdRow.name }
  } catch (err) {
    // Best-effort cleanup to avoid storage leaks and dangling DB rows.
    try {
      await unlink(tmpPath)
    } catch {
      /* ignore */
    }
    try {
      await unlink(resolved.fullPath)
    } catch {
      /* ignore */
    }
    if (createdRow) {
      try {
        await prisma.memberAvatar.delete({ where: { id: createdRow.id } })
      } catch {
        /* ignore */
      }
    }
    throw err
  }
}

export type RemoveMemberAvatarResult =
  | { kind: 'ok'; data: { id: string } }
  | { kind: 'not_found' }

/** `DELETE /v1/members/me/avatar`. Returns `not_found` when no avatar is set. */
export async function removeMemberAvatar(
  userId: string
): Promise<RemoveMemberAvatarResult> {
  const member = await prisma.member.findUnique({
    where: { twreporter_user_id: userId },
    select: { id: true, avatarId: true },
  })
  if (!member?.avatarId) return { kind: 'not_found' }

  const old = await prisma.memberAvatar.findUnique({
    where: { id: member.avatarId },
  })
  if (!old) return { kind: 'not_found' }

  await prisma.$transaction([
    prisma.member.update({
      where: { id: member.id },
      data: { avatarId: null },
    }),
    prisma.memberAvatar.delete({ where: { id: old.id } }),
  ])

  // Only unlink the file after the DB transaction succeeds.
  await tryUnlinkAvatarFile(old)

  return { kind: 'ok', data: { id: String(old.id) } }
}
