import { PostSummary } from '@/components/types'
import { AUTHOR_ROLES_IN_ORDER, AuthorRole, DEFAULT_AVATAR } from '@/constants'
import { PostDetail } from '@/types/api'
import { getPostSummaries } from '@/utils'

import { Author, AuthorGroup } from '../types'

function parsePostToContent(post: PostDetail) {
  // Assemble authors for brief
  const authorsJSON = post?.authorsJSON as {
    id: string
    name: string
    role: string
    type: 'link' | 'string'
  }[]

  const authorsInBrief: AuthorGroup[] = (authorsJSON ?? []).reduce(
    (acc: AuthorGroup[], authorJSON) => {
      const author = post?.authors?.find((a) => a?.id === authorJSON?.id)
      const authorObj = {
        name: author?.name ?? authorJSON.name,
        link: author?.slug ? `/author/${author.slug}` : '',
      }

      const authorGroup = acc.find((group) => group.title === authorJSON.role)
      if (authorGroup) {
        authorGroup.authors.push(authorObj)
      } else {
        acc.push({ title: authorJSON.role, authors: [authorObj] })
      }
      return acc
    },
    [] as AuthorGroup[]
  )
  // Assemble ordered authors for AuthorCard
  type AuthorWithLink = Author & { link: string }
  const authors: AuthorWithLink[] =
    post?.authors
      ?.map((author) => {
        const authorJSON = authorsJSON.find(
          (authorJSON) => authorJSON.id === author?.id
        )
        if (!authorJSON) {
          return undefined
        }
        const avatarURL = author?.avatar?.resized?.tiny
        return {
          id: author.id,
          slug: author.slug ?? '',
          name: author.name ?? '',
          avatar: avatarURL ?? DEFAULT_AVATAR,
          bio: author.bio ?? '',
          role: authorJSON.role as AuthorRole,
          link: authorJSON.type === 'link' ? `/author/${author.slug}` : '',
        }
      })
      .filter((author) => author !== undefined) ?? []

  // Sort authors by AUTHOR_ROLES_IN_ORDER
  const orderedAuthors = authors
    ?.filter((author: AuthorWithLink) => author?.link)
    ?.map((author: AuthorWithLink) => {
      const roles = author?.role?.split('、')
      const priority = AUTHOR_ROLES_IN_ORDER.indexOf(roles?.[0] as AuthorRole)
      return {
        ...author,
        priority: priority === -1 ? AUTHOR_ROLES_IN_ORDER.length : priority,
      }
    })
    ?.sort((a, b) => {
      return a.priority - b.priority
    })

  // Topic related data
  const topic = post?.projects?.[0]

  // Related posts data: related posts or topic's related post
  let relatedPosts: ReturnType<typeof getPostSummaries> = []
  if (
    post?.relatedPostsOrdered?.length &&
    post?.relatedPostsOrdered?.length > 0
  ) {
    relatedPosts = getPostSummaries(post.relatedPostsOrdered ?? [])
  } else if (topic?.relatedPosts?.length && topic?.relatedPosts?.length > 0) {
    relatedPosts = getPostSummaries(topic?.relatedPosts ?? [])
  }

  // Main project data
  // TODO: project/main project are duplicate data, should be refactored
  const mainTopic = post?.mainProject
  const topicURL = mainTopic?.slug ? `/topic/${mainTopic.slug}` : undefined

  // Subcategory related data
  const subSubcategory = post?.subSubcategoriesOrdered?.[0]
  const subcategory = subSubcategory?.subcategory
  const category = subcategory?.category
  const subSubcategoryURL =
    category?.slug && subcategory?.slug && subSubcategory?.slug
      ? `/category/${category.slug}/${subcategory.slug}/${subSubcategory.slug}`
      : ''

  type TwReporterRelatedPostJson = {
    ogTitle?: string
    src: string
    ogImgSrc?: string
    ogDescription?: string
    publishedDate?: string
    subcategory?: string
    category?: string
  }

  const twReporterRelatedPosts: PostSummary[] = (
    (post?.TWReporterRelatedPostsJSON as
      | TwReporterRelatedPostJson[]
      | null
      | undefined) ?? []
  ).map((twReporterPost) => ({
    title: twReporterPost.ogTitle ?? '',
    url: twReporterPost.src,
    image: twReporterPost.ogImgSrc ?? '',
    desc: twReporterPost.ogDescription ?? '',
    category: twReporterPost.category ?? '',
    subSubcategory: twReporterPost.subcategory ?? '',
    publishedDate: twReporterPost.publishedDate ?? '',
  }))

  return {
    topicURL,
    mainTopic,
    subSubcategory,
    subSubcategoryURL,
    authorsInBrief,
    orderedAuthors,
    relatedPosts,
    twReporterRelatedPosts,
  }
}

export default parsePostToContent
