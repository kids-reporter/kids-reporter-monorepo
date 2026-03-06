import { Post } from '__generated__/types'
import { cn } from '@kids-reporter/routing-ui'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { getCallBaodaozaiIntroContent } from '@/api/call-baodaozai-intro'
import {
  getCategoryMetadata,
  getCategoryPosts,
  getCategorySubcategoriesAndThemeColor,
} from '@/api/category'
import { getSubSubcategoryPosts } from '@/api/sub-subcategory'
import { getSubcategoryPosts } from '@/api/subcategory'
import Pagination from '@/components/pagination'
import PostList from '@/components/post-list'
import {
  CATEGORY_IMAGES,
  DEFAULT_THEME_COLOR,
  ERROR_PAGE,
  GENERAL_DESCRIPTION,
  POST_PER_PAGE,
  Theme,
} from '@/constants'
import { BaodaozaiVisibilitySetter } from '@/services/call-baodaozai'
import { DeepPartial } from '@/types/utils'
import { getPostSummaries, log, LogLevel } from '@/utils'
import {
  mapCategorySlugToIntroPageType,
  mapCategoryThemeToClassName,
  parseCategoryInfoFromPath,
} from '@/utils/category'

import Navigator from '../../_components/category/navigator'
import CategoryModule from './_components/module'

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

  const categoryData = await getCategoryMetadata({
    categoryWhere: { slug: category },
    subcategoryWhere: { slug: { equals: subcategory } },
  })

  if (!categoryData) {
    log(
      LogLevel.INFO,
      `Category metadata not found. URL path is: /${path?.join('/') ?? ''}`
    )
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

  if (!category) {
    log(
      LogLevel.INFO,
      `Category metadata not found. URL path is: /${params.path?.join('/') ?? ''}`
    )
    return {}
  }

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

function getPosts({
  category,
  subcategory,
  subSubcategory,
  currentPage,
}: {
  category: string
  subcategory?: string
  subSubcategory?: string
  currentPage: number
}) {
  const commonVariables = {
    take: POST_PER_PAGE,
    skip: (currentPage - 1) * POST_PER_PAGE,
  }
  if (subSubcategory) {
    return getSubSubcategoryPosts({
      where: { slug: subSubcategory },
      ...commonVariables,
      orderBy: [
        {
          publishedDate: 'desc',
        },
      ],
    })
  }
  if (subcategory) {
    return getSubcategoryPosts({
      where: { slug: subcategory },
      ...commonVariables,
    })
  }

  return getCategoryPosts({
    where: { slug: category },
    ...commonVariables,
  })
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

  if (isNotFound || !category) {
    log(LogLevel.WARNING, `Category not found! ${path}`)
    notFound()
  }

  const imageURL = CATEGORY_IMAGES[category]
  const pageEnum = mapCategorySlugToIntroPageType(category)

  const introContent = pageEnum
    ? await getCallBaodaozaiIntroContent({ where: { page: pageEnum } })
    : undefined

  const categoryData = await getCategorySubcategoriesAndThemeColor({
    where: { slug: category },
  })
  if (!categoryData) {
    log(LogLevel.WARNING, 'Incorrect category!')
    notFound()
  }
  const theme = (categoryData.themeColor || DEFAULT_THEME_COLOR) as Theme
  const subcategories =
    categoryData.subcategories?.map((sub) => {
      return {
        name: sub.name ?? '',
        path: `/category/${category}/${sub.slug}`,
      }
    }) ?? []

  const navigationItems = [
    { name: '所有文章', path: `/category/${category}` },
    ...subcategories,
  ]

  // Fetch related posts of subSubcategory/subcategory/category
  const postsRes = await getPosts({
    category,
    subcategory,
    subSubcategory,
    currentPage,
  })

  if (!postsRes) {
    log(LogLevel.WARNING, `Empty related posts!`)
    redirect(ERROR_PAGE)
  }

  if ('subcategory' in postsRes) {
    const subcategoryCandidate = postsRes?.subcategory?.slug
    const categoryCandidate = postsRes?.subcategory?.category?.slug
    if (
      subcategory !== subcategoryCandidate ||
      category !== categoryCandidate
    ) {
      log(
        LogLevel.WARNING,
        `Parent category mismatch! subcategory=${subcategoryCandidate}, category=${categoryCandidate}`
      )
      redirect(ERROR_PAGE)
    }
  }

  if ('category' in postsRes) {
    const categoryCandidate = postsRes?.category?.slug
    if (category !== categoryCandidate) {
      log(
        LogLevel.WARNING,
        `Parent category mismatch! category=${categoryCandidate}`
      )
      redirect(ERROR_PAGE)
    }
  }

  const relatedPostsRaw = postsRes.relatedPosts ?? []
  const relatedPosts = relatedPostsRaw.filter(isPost)

  const posts = getPostSummaries(relatedPosts)
  const postsCount = postsRes.relatedPostsCount ?? 0

  const totalPages = Math.ceil(postsCount / POST_PER_PAGE)
  if (totalPages > 0 && currentPage > totalPages) {
    log(
      LogLevel.WARNING,
      `Incorrect page! currentPage=${currentPage}, totalPages=${totalPages}`
    )
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
    <main
      style={{ width: '95vw' }}
      className="mb-10 flex flex-col items-center justify-center"
    >
      <div
        className={cn(
          mapCategoryThemeToClassName(theme),
          'flex w-full flex-col items-center justify-center gap-10'
        )}
      >
        <img className="w-full max-w-xl" src={imageURL} loading="lazy" />
        {pageEnum && (
          <>
            <BaodaozaiVisibilitySetter show={true} />
            <CategoryModule introContent={introContent ?? ''} />
          </>
        )}
        <div className="flex flex-row flex-wrap justify-center gap-2.5">
          {navigationItems?.map(
            (item, index) =>
              item && (
                <Navigator
                  key={`category-navigation-${index}`}
                  name={item.name}
                  path={item.path}
                  active={
                    item.path ===
                    `/category/${category}${
                      subcategory ? `/${subcategory}` : ''
                    }`
                  }
                />
              )
          )}
        </div>
        <PostList posts={posts} />
        {totalPages > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            routingPrefix={routingPrefix}
          />
        )}
      </div>
    </main>
  )
}
