import type {
  CreateBookmarkResponse,
  MemberBookmarksResponse,
  V1CreateBookmarkBody,
} from '@/types/api'
import type { TraceHeaders } from '@/types/trace-headers'
import { sendContentApiRequest } from '@/utils/send-content-api'

export type BookmarkLookup = { id: string }
export type BookmarkType = V1CreateBookmarkBody['type']

function assertBookmarksResponse(
  data: MemberBookmarksResponse | null | undefined
): MemberBookmarksResponse {
  if (!data || !Array.isArray(data.bookmarks)) {
    throw new Error('content-api invalid bookmarks response')
  }
  return data
}

export async function listBookmarksContentApi({
  accessToken,
  take,
  skip,
  traceHeaders,
}: {
  accessToken: string
  take: number
  skip: number
  traceHeaders?: TraceHeaders
}): Promise<MemberBookmarksResponse> {
  const data = await sendContentApiRequest<MemberBookmarksResponse>({
    path: '/v1/members/me/bookmarks',
    method: 'GET',
    authToken: accessToken,
    query: { take, skip },
    traceHeaders,
  })
  return assertBookmarksResponse(data)
}

export async function getBookmarkBySlugContentApi({
  accessToken,
  type,
  slug,
  traceHeaders,
}: {
  accessToken: string
  type: BookmarkType
  slug: string
  traceHeaders?: TraceHeaders
}): Promise<BookmarkLookup | null> {
  const data = await sendContentApiRequest<MemberBookmarksResponse>({
    path: '/v1/members/me/bookmarks',
    method: 'GET',
    authToken: accessToken,
    query: { type, slug, take: 1 },
    traceHeaders,
  })
  const bookmarks = assertBookmarksResponse(data).bookmarks
  const first = bookmarks[0]
  return first?.id ? { id: first.id } : null
}

export async function createBookmarkContentApi(
  body: V1CreateBookmarkBody,
  accessToken: string,
  traceHeaders?: TraceHeaders
): Promise<CreateBookmarkResponse> {
  return sendContentApiRequest<CreateBookmarkResponse>({
    path: '/v1/members/me/bookmarks',
    method: 'POST',
    authToken: accessToken,
    body,
    traceHeaders,
  })
}

export async function deleteBookmarkContentApi(
  id: string | number,
  accessToken: string,
  traceHeaders?: TraceHeaders
): Promise<{ id: string }> {
  if (id === '' || id == null) {
    throw new Error('deleteBookmarkContentApi: id is required')
  }
  return sendContentApiRequest<{ id: string }>({
    path: `/v1/members/me/bookmarks/${encodeURIComponent(String(id))}`,
    method: 'DELETE',
    authToken: accessToken,
    traceHeaders,
  })
}
