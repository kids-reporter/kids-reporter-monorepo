import { getSubSubcategoryPostsContentApi } from '@/api/content-api/sub-subcategory-posts'
import type {
  SubSubcategoryPostsResponse,
  V1SubSubcategoryPostsRequest,
} from '@/types/api'
import type { TraceHeaders } from '@/types/trace-headers'

export const getSubSubcategoryPosts = async (
  variables: V1SubSubcategoryPostsRequest,
  traceHeaders?: TraceHeaders
): Promise<SubSubcategoryPostsResponse | undefined> => {
  const { slug, take, skip, orderBy } = variables
  if (!slug) return undefined
  return getSubSubcategoryPostsContentApi({
    slug,
    take: take ?? undefined,
    skip: skip ?? undefined,
    orderBy: orderBy ?? 'publishedDate:desc',
    traceHeaders,
  })
}
