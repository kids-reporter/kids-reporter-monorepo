import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PostList from '@/app/components/post-list'
import Navigator from './navigator'
import Pagination from '@/app/components/pagination'
import {
  API_URL,
  GENERAL_DESCRIPTION,
  POST_PER_PAGE,
  POST_CONTENT_GQL,
  DEFAULT_THEME_COLOR,
} from '@/app/constants'
import { getPostSummaries, sendGQLRequest, log, LogLevel } from '@/app/utils'
import './page.scss'

export const metadata: Metadata = {
  title: '分類: 少年報導者 The Reporter for Kids',
  description: GENERAL_DESCRIPTION,
}

const subcategoriesGQL = `
query($where: CategoryWhereUniqueInput!) {
  category(where: $where) {
    subcategories {
      name
      slug
    }
    themeColor
  }
}
`

const categoryPostsGQL = `
query($where: CategoryWhereUniqueInput!, $take: Int!, $skip: Int!) {
  category(where: $where) {
    relatedPosts(take: $take, skip: $skip) {
      ${POST_CONTENT_GQL}
    }
    relatedPostsCount
  }
}
`

const subcategoryPostsGQL = `
query($where: SubcategoryWhereUniqueInput!, $take: Int!, $skip: Int!) {
  subcategory(where: $where) {
    category {
      slug
    }
    relatedPosts(take: $take, skip: $skip) {
      ${POST_CONTENT_GQL}
    }
    relatedPostsCount
  }
}
`

const subSubcategoryPostsGQL = `
query($where: SubSubcategoryWhereUniqueInput!, $take: Int!, $skip: Int!) {
  subSubcategory(where: $where) {
    subcategory {
      slug
      category {
        slug
      }
    }
    relatedPosts(take: $take, skip: $skip) {
      ${POST_CONTENT_GQL}
    }
    relatedPostsCount
  }
}
`

const getImageFromCategory = (category: string) => {
  let imageURL
  if (category === 'news') {
    imageURL = '/assets/images/category_news.svg'
  } else if (category === 'listening-news') {
    imageURL = '/assets/images/category_listening_news.svg'
  } else if (category === 'comics') {
    imageURL = '/assets/images/category_comics.svg'
  } else {
    imageURL = '/assets/images/category_campus.svg'
  }
  return imageURL
}

export default async function Category({ params }: { params: { path: any } }) {
  const path = params.path
  if (!path || !Array.isArray(path) || path.length === 0) {
    log(LogLevel.WARNING, `Incorrect category path! ${path}`)
    notFound()
  }

  // Category page routing scenarios:   ex: /category/path[0]/path[1]/path[2]...
  // -------------------------------------------------------------------------------
  // length = 1(category)               ex: /category/news
  // length = 2(subcategory)            ex: /category/news/times
  // length = 3(subSubcategory)         ex: /category/news/times/medical-news
  // length = 3(category, page N)       ex: /category/news/page/2
  // length = 4(subcategory, page N)    ex: /category/news/times/page/2
  // length = 5(subSubcategory, page N) ex: /category/news/times/medical-news/page/2
  let category = '',
    subcategory = '',
    subSubcategory = '',
    theme = '',
    currentPage = 1
  if (path.length === 1 && path[0]) {
    category = path[0]
  } else if (path.length === 2 && path[0] && path[1]) {
    category = path[0]
    subcategory = path[1]
  } else if (path.length === 3 && path[0] && path[1] && path[2]) {
    if (
      path[1] === 'page' &&
      Number.isInteger(Number(path[2])) &&
      Number(path[2]) > 0
    ) {
      category = path[0]
      currentPage = Number(path[2])
    } else {
      category = path[0]
      subcategory = path[1]
      subSubcategory = path[2]
    }
  } else if (
    path.length === 4 &&
    path[0] &&
    path[1] &&
    path[2] &&
    path[3] &&
    path[2] === 'page' &&
    Number.isInteger(Number(path[3])) &&
    Number(path[3]) > 0
  ) {
    category = path[0]
    subcategory = path[1]
    currentPage = Number(path[3])
  } else if (
    path.length === 5 &&
    path[0] &&
    path[1] &&
    path[2] &&
    path[3] &&
    path[4] &&
    path[3] === 'page' &&
    Number.isInteger(Number(path[4])) &&
    Number(path[4]) > 0
  ) {
    category = path[0]
    subcategory = path[1]
    subSubcategory = path[2]
    currentPage = Number(path[4])
  } else {
    log(LogLevel.WARNING, `Incorrect category path! ${path}`)
    notFound()
  }

  // Fetch subcategories for navigation
  const navigationItems = []
  const subcategoriesRes = await sendGQLRequest(API_URL, {
    query: subcategoriesGQL,
    variables: {
      where: {
        slug: category,
      },
    },
  })
  const categoryData = subcategoriesRes?.data?.data?.category
  if (!categoryData) {
    log(LogLevel.WARNING, 'Incorrect category!')
    notFound()
  }
  theme = categoryData.themeColor || DEFAULT_THEME_COLOR
  const subcategories = categoryData.subcategories?.map((sub: any) => {
    return (
      sub && {
        name: sub.name,
        path: `/category/${category}/${sub.slug}`,
      }
    )
  })

  navigationItems.push({ name: '所有文章', path: `/category/${category}` })
  if (Array.isArray(subcategories) && subcategories.length > 0) {
    navigationItems.push(...subcategories)
  }

  // Fetch related posts of subSubcategory/subcategory/category
  let query, slug
  if (subSubcategory) {
    query = subSubcategoryPostsGQL
    slug = subSubcategory
  } else if (subcategory) {
    query = subcategoryPostsGQL
    slug = subcategory
  } else {
    query = categoryPostsGQL
    slug = category
  }
  const postsRes = await sendGQLRequest(API_URL, {
    query: query,
    variables: {
      where: {
        slug: slug,
      },
      take: POST_PER_PAGE,
      skip: (currentPage - 1) * POST_PER_PAGE,
    },
  })
  if (!postsRes) {
    log(LogLevel.WARNING, `Empty related posts!`)
    notFound()
  }

  let targetCategory
  if (subSubcategory) {
    targetCategory = postsRes?.data?.data?.subSubcategory
    if (
      subcategory !== targetCategory?.subcategory?.slug ||
      category !== targetCategory?.subcategory?.category?.slug
    ) {
      log(
        LogLevel.WARNING,
        `Parent category mismatch! subSubcategory=${subSubcategory}, subcategory=${targetCategory?.subcategory?.slug}/${subcategory}, category=${targetCategory?.subcategory?.category?.slug}/${category}`
      )
      notFound()
    }
  } else if (subcategory) {
    targetCategory = postsRes?.data?.data?.subcategory
    if (category !== targetCategory?.category?.slug) {
      log(
        LogLevel.WARNING,
        `Parent category mismatch! subcategory=${subcategory}, category=${targetCategory?.category?.slug}/${category}`
      )
      notFound()
    }
  } else {
    targetCategory = postsRes?.data?.data?.category
  }

  if (!targetCategory) {
    log(LogLevel.WARNING, 'Fetch targetCategory failed!')
    notFound()
  }

  const posts = getPostSummaries(targetCategory.relatedPosts)
  const postsCount = targetCategory.relatedPostsCount

  const totalPages = Math.ceil(postsCount / POST_PER_PAGE)
  if (totalPages > 0 && currentPage > totalPages) {
    log(
      LogLevel.WARNING,
      `Incorrect page! currentPage=${currentPage}, totalPages=${totalPages}`
    )
    notFound()
  }

  let routingPrefix
  if (subSubcategory) {
    routingPrefix = `/category/${category}/${subcategory}/${subSubcategory}/page`
  } else if (subcategory) {
    routingPrefix = `/category/${category}/${subcategory}/page`
  } else {
    routingPrefix = `/category/${category}/page`
  }

  const imageURL = getImageFromCategory(category)

  return (
    <main className="container">
      <div className={`content theme-${theme}`}>
        <img className="title-image" src={imageURL} />
        <div className="navigation">
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
