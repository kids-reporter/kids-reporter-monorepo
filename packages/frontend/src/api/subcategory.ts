import { getSubcategoriesContentApi } from '@/api/content-api/subcategories'
import { getSubcategoryPostsContentApi } from '@/api/content-api/subcategory-posts'
import type {
  SubcategoryItem,
  SubcategoryPostsResponse,
  V1SubcategoryPostsRequest,
} from '@/types/api'
import type { TraceHeaders } from '@/types/trace-headers'

export const getSubcategoryPosts = async (
  variables: V1SubcategoryPostsRequest,
  traceHeaders?: TraceHeaders
): Promise<SubcategoryPostsResponse | undefined> => {
  const { slug, take, skip } = variables
  if (!slug) return undefined
  return getSubcategoryPostsContentApi({
    slug,
    take: take ?? undefined,
    skip: skip ?? undefined,
    traceHeaders,
  })
}

export const getSubcategories = async (
  traceHeaders?: TraceHeaders
): Promise<SubcategoryItem[] | undefined> => {
  return getSubcategoriesContentApi({ traceHeaders })
}
