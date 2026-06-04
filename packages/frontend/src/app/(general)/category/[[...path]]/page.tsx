import { emitStructured } from '@kids-reporter/logger'
import { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

import { getCallBaodaozaiIntroContent } from '@/api/call-baodaozai-intro'
import {
  getCategoryMetadata,
  getCategoryPosts,
  getCategorySubcategoriesAndThemeColor,
} from '@/api/category'
import { getSubSubcategoryPosts } from '@/api/sub-subcategory'
import { getSubcategoryPosts } from '@/api/subcategory'
import {
  CATEGORY_DISPLAY_NAME_FALLBACK,
  ERROR_PAGE,
  GENERAL_DESCRIPTION,
  POST_PER_PAGE,
} from '@/constants'
import CategoryCollectionModule from '@/modules/category-collection'
import {
  CategoryPostsResponse,
  Post,
  SubcategoryPostsResponse,
  SubSubcategoryPostsResponse,
} from '@/types/api'
import { DeepPartial } from '@/types/utils'
import { getPostSummaries } from '@/utils'
import {
  mapCategorySlugToIntroPageType,
  parseCategoryInfoFromPath,
} from '@/utils/category'
import { getServerTraceHeaders } from '@/utils/trace-context'

function isPost(
  post: DeepPartial<Post> | null | undefined
): post is DeepPartial<Post> {
  return post !== null && post !== undefined
}

export async function generateMetadata({
  params,
}: {
  params: { path: string[] | undefined }
}): Promise<Metadata> {
  const path = params.path
  const { category, subcategory } = parseCategoryInfoFromPath(path)
  const traceHeaders = getServerTraceHeaders(headers())

  if (!category) {
    emitStructured({
      severity: 'INFO',
      message: `Category metadata not found. URL path is: /${path?.join('/') ?? ''}`,
    })
    return {}
  }

  const categoryData = await getCategoryMetadata(
    {
      slug: category,
      subcategorySlug: subcategory,
    },
    traceHeaders
  )

  if (!categoryData) {
    emitStructured({
      severity: 'INFO',
      message: `Category metadata not found. URL path is: /${path?.join('/') ?? ''}`,
    })
    return {}
  }

  const title =
    categoryData?.subcategories?.[0]?.ogTitle ||
    categoryData?.ogTitle ||
    '分類: 少年報導者 The Reporter for Kids'
  const description =
    categoryData?.subcategories?.[0]?.ogDescription ||
    categoryData?.ogDescription ||
    GENERAL_DESCRIPTION
  const ogImage =
    categoryData?.subcategories?.[0]?.ogImage?.resized?.medium ??
    categoryData?.ogImage?.resized?.medium

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage,
    },
  }
}

type CategoryPostsResult =
  | CategoryPostsResponse
  | SubcategoryPostsResponse
  | SubSubcategoryPostsResponse

function getPosts(
  {
    category,
    subcategory,
    subSubcategory,
    currentPage,
  }: {
    category: string
    subcategory?: string
    subSubcategory?: string
    currentPage: number
  },
  traceHeaders?: Headers | Record<string, string | undefined>
): Promise<CategoryPostsResult | undefined> {
  const commonVariables = {
    take: POST_PER_PAGE,
    skip: (currentPage - 1) * POST_PER_PAGE,
  }
  if (subSubcategory) {
    return getSubSubcategoryPosts(
      {
        slug: subSubcategory,
        ...commonVariables,
        orderBy: 'publishedDate:desc',
      },
      traceHeaders
    )
  }
  if (subcategory) {
    return getSubcategoryPosts(
      {
        slug: subcategory,
        ...commonVariables,
      },
      traceHeaders
    )
  }

  return getCategoryPosts(
    {
      slug: category,
      ...commonVariables,
    },
    traceHeaders
  )
}

export default async function Category({
  params,
}: {
  params: { path: string[] | undefined }
}) {
  // Category page routing scenarios:   ex: /category/path[0]/path[1]/path[2]...
  // -------------------------------------------------------------------------------
  // length = 1(category)               ex: /category/news
  // length = 2(subcategory)            ex: /category/news/times
  // length = 3(subSubcategory)         ex: /category/news/times/medical-news
  // length = 3(category, page N)       ex: /category/news/page/2
  // length = 4(subcategory, page N)    ex: /category/news/times/page/2
  // length = 5(subSubcategory, page N) ex: /category/news/times/medical-news/page/2
  const path = params.path
  const {
    category,
    subcategory,
    subSubcategory,
    currentPage = 1,
    isNotFound,
  } = parseCategoryInfoFromPath(path)
  const traceHeaders = getServerTraceHeaders(headers())
  if (isNotFound || !category) {
    emitStructured({
      severity: 'WARNING',
      message: `Category not found! ${path}`,
    })
    notFound()
  }

  const pageEnum = mapCategorySlugToIntroPageType(category)

  const introContent = pageEnum
    ? await getCallBaodaozaiIntroContent({ page: pageEnum }, traceHeaders)
    : undefined

  const categoryData = await getCategorySubcategoriesAndThemeColor(
    { slug: category },
    traceHeaders
  )
  if (!categoryData) {
    emitStructured({ severity: 'WARNING', message: 'Incorrect category!' })
    notFound()
  }
  const collectionTitle =
    categoryData.name?.trim() || CATEGORY_DISPLAY_NAME_FALLBACK[category]
  const subcategories =
    categoryData.subcategories?.map((sub) => {
      return {
        name: sub.name ?? '',
        path: `/category/${category}/${sub.slug}`,
      }
    }) ?? []

  const activeCategoryPath = `/category/${category}${
    subcategory ? `/${subcategory}` : ''
  }`

  const navigationItems = [
    { name: '所有文章', path: `/category/${category}` },
    ...subcategories,
  ].map((item) => ({
    name: item.name,
    path: item.path,
    active: item.path === activeCategoryPath,
  }))

  // Fetch related posts of subSubcategory/subcategory/category
  const postsRes = await getPosts(
    {
      category,
      subcategory,
      subSubcategory,
      currentPage,
    },
    traceHeaders
  )

  if (!postsRes) {
    emitStructured({ severity: 'WARNING', message: 'Empty related posts!' })
    redirect(ERROR_PAGE)
  }

  if ('subcategory' in postsRes && postsRes.subcategory) {
    const subcategoryCandidate = postsRes.subcategory.slug
    const categoryCandidate = postsRes.subcategory.category.slug
    if (
      subcategory !== subcategoryCandidate ||
      category !== categoryCandidate
    ) {
      emitStructured({
        severity: 'WARNING',
        message: `Parent category mismatch! subcategory=${subcategoryCandidate}, category=${categoryCandidate}`,
      })
      redirect(ERROR_PAGE)
    }
  } else if ('category' in postsRes && postsRes.category && subcategory) {
    const categoryCandidate = postsRes.category.slug
    if (category !== categoryCandidate) {
      emitStructured({
        severity: 'WARNING',
        message: `Parent category mismatch! category=${categoryCandidate}`,
      })
      redirect(ERROR_PAGE)
    }
  }

  const relatedPostsRaw = postsRes.relatedPosts ?? []
  const relatedPosts = relatedPostsRaw.filter(isPost)

  const posts = getPostSummaries(relatedPosts)
  const postsCount = postsRes.relatedPostsCount ?? 0

  const totalPages = Math.ceil(postsCount / POST_PER_PAGE)
  if (totalPages > 0 && currentPage > totalPages) {
    emitStructured({
      severity: 'WARNING',
      message: `Incorrect page! currentPage=${currentPage}, totalPages=${totalPages}`,
    })
    notFound()
  }

  const routingPrefix = (() => {
    if (subSubcategory) {
      return `/category/${category}/${subcategory}/${subSubcategory}/page`
    } else if (subcategory) {
      return `/category/${category}/${subcategory}/page`
    } else {
      return `/category/${category}/page`
    }
  })()

  return (
    <CategoryCollectionModule
      categorySlug={category}
      title={collectionTitle}
      introContent={introContent ?? ''}
      showIntro={Boolean(pageEnum) && currentPage === 1}
      posts={posts}
      navigationItems={navigationItems}
      totalPages={totalPages}
      currentPage={currentPage}
      routingPrefix={routingPrefix}
    />
  )
}
