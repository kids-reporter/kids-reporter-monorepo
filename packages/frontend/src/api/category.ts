import {
  getCategoryMetadataContentApi,
  getCategoryPostsContentApi,
  getCategorySubcategoriesThemeContentApi,
} from '@/api/content-api/category-collection'
import type {
  CategoryMetadataResponse,
  CategoryPostsResponse,
  CategorySubcategoriesThemeResponse,
  V1CategoryMetadataRequest,
  V1CategoryPostsRequest,
  V1CategorySubcategoriesThemeRequest,
} from '@/types/api'
import type { TraceHeaders } from '@/types/trace-headers'

export const getCategoryPosts = async (
  variables: V1CategoryPostsRequest,
  traceHeaders?: TraceHeaders
): Promise<CategoryPostsResponse | undefined> => {
  const { slug, take, skip } = variables
  if (!slug) return undefined
  return getCategoryPostsContentApi({
    slug,
    take: take ?? undefined,
    skip: skip ?? undefined,
    traceHeaders,
  })
}

export const getCategoryMetadata = async (
  variables: V1CategoryMetadataRequest,
  traceHeaders?: TraceHeaders
): Promise<CategoryMetadataResponse | undefined> => {
  const { slug, subcategorySlug } = variables
  if (!slug) return undefined
  return getCategoryMetadataContentApi({
    slug,
    subcategorySlug: subcategorySlug ?? undefined,
    traceHeaders,
  })
}

export const getCategorySubcategoriesAndThemeColor = async (
  variables: V1CategorySubcategoriesThemeRequest,
  traceHeaders?: TraceHeaders
): Promise<CategorySubcategoriesThemeResponse | undefined> => {
  const { slug } = variables
  if (!slug) return undefined
  return getCategorySubcategoriesThemeContentApi({ slug, traceHeaders })
}
