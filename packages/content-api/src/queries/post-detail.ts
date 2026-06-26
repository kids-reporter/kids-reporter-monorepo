import {
  V1PostDetailBodySchema,
  V1PostEssayQuestionsBodySchema,
  V1PostMetaBodySchema,
  V1PostsEssayAnswersWithLikesResponseSchema,
  V1ProjectBySlugDetailResponseSchema,
  V1ProjectBySlugMetaResponseSchema,
} from '@kids-reporter/api-types'
import { type Prisma, prisma } from '@kids-reporter/db'
import type { z } from 'zod'

import { maskEmail } from '../utils/mask-email.js'
import {
  buildMemberAvatarFileUrl,
  essayAnswerOrderByFromFlat,
} from '../utils/qna-utils.js'
import {
  asOrderJson,
  buildPostBySlugVisibilityWhere,
  buildProjectBySlugVisibilityWhere,
  buildPublicPostWhere,
  buildResizedLarge,
  buildResizedMedium,
  buildResizedSmall,
  buildResizedTiny,
  orderTargetsByOrderJson,
  type PostCardRow,
  postCardSelect,
} from '../utils/v1-helpers.js'

type V1ProjectBySlugMetaResponse = z.infer<
  typeof V1ProjectBySlugMetaResponseSchema
>
type V1ProjectBySlugDetailResponse = z.infer<
  typeof V1ProjectBySlugDetailResponseSchema
>
type V1PostDetailBody = z.infer<typeof V1PostDetailBodySchema>
type V1PostMetaBody = z.infer<typeof V1PostMetaBodySchema>
type V1PostEssayQuestionsBody = z.infer<typeof V1PostEssayQuestionsBodySchema>
type V1PostsEssayAnswersWithLikesResponse = z.infer<
  typeof V1PostsEssayAnswersWithLikesResponseSchema
>

const subSubFullSelect = {
  id: true,
  name: true,
  slug: true,
  subcategory: {
    select: {
      name: true,
      slug: true,
      category: {
        select: {
          name: true,
          slug: true,
          themeColor: true,
        },
      },
    },
  },
} as const

const mapSubSubFull = (
  row: Prisma.SubSubcategoryGetPayload<{ select: typeof subSubFullSelect }>
) => ({
  name: row.name,
  slug: row.slug,
  subcategory: row.subcategory
    ? {
        name: row.subcategory.name,
        slug: row.subcategory.slug,
        category: row.subcategory.category
          ? {
              name: row.subcategory.category.name,
              slug: row.subcategory.category.slug,
              themeColor: row.subcategory.category.themeColor,
            }
          : undefined,
      }
    : undefined,
})

type ProjectNestedSubRow = {
  name: string
  subcategory: {
    name: string
    category: { slug: string; themeColor: string | null } | null
  } | null
}

const mapSubSubProjectNested = (row: ProjectNestedSubRow) => ({
  name: row.name,
  subcategory: row.subcategory
    ? {
        name: row.subcategory.name,
        category: row.subcategory.category
          ? {
              slug: row.subcategory.category.slug,
              themeColor: row.subcategory.category.themeColor,
            }
          : undefined,
      }
    : undefined,
})

const projectNestedPostSelect = {
  id: true,
  title: true,
  slug: true,
  ogDescription: true,
  publishedDate: true,
  heroImage: {
    select: { imageFile_id: true, imageFile_extension: true },
  },
  subSubcategories: {
    select: {
      id: true,
      name: true,
      subcategory: {
        select: {
          name: true,
          category: { select: { slug: true, themeColor: true } },
        },
      },
    },
  },
  subSubcategoriesOrderJson: true,
} as const

const relatedPostCardSelect = {
  ...postCardSelect,
  subSubcategories: {
    select: {
      id: true,
      name: true,
      slug: true,
      subcategory: {
        select: {
          name: true,
          slug: true,
          category: {
            select: {
              name: true,
              slug: true,
              themeColor: true,
            },
          },
        },
      },
    },
  },
} as const

type RelatedPostRow = Prisma.PostGetPayload<{
  select: typeof relatedPostCardSelect
}>

const mapRelatedPostOrdered = (p: RelatedPostRow) => {
  const subSubcategoriesOrdered = orderTargetsByOrderJson(
    p.subSubcategories,
    asOrderJson(p.subSubcategoriesOrderJson)
  ).map(mapSubSubFull)
  return {
    title: p.title,
    slug: p.slug,
    publishedDate: p.publishedDate ? p.publishedDate.toISOString() : undefined,
    ogDescription: p.ogDescription,
    heroImage: p.heroImage
      ? {
          resized: {
            small: buildResizedSmall(p.heroImage),
            medium: buildResizedMedium(p.heroImage),
            large: buildResizedLarge(p.heroImage),
          },
        }
      : undefined,
    subSubcategoriesOrdered,
  }
}

export async function fetchPublishedProjectMetaBySlug(
  slug: string
): Promise<V1ProjectBySlugMetaResponse | null> {
  const project = await prisma.project.findFirst({
    where: { AND: [{ slug }, buildProjectBySlugVisibilityWhere()] },
    select: {
      publishedDate: true,
      ogDescription: true,
      ogTitle: true,
      ogImage: {
        select: { imageFile_id: true, imageFile_extension: true },
      },
    },
  })
  if (!project) return null
  const result = {
    publishedDate: project.publishedDate?.toISOString(),
    ogDescription: project.ogDescription,
    ogTitle: project.ogTitle,
    ogImage: project.ogImage
      ? { resized: { small: buildResizedSmall(project.ogImage) } }
      : null,
  }
  return result
}

export async function fetchPublishedProjectDetailBySlug(
  slug: string,
  now: Date
): Promise<V1ProjectBySlugDetailResponse | null> {
  const project = await prisma.project.findFirst({
    where: { AND: [{ slug }, buildProjectBySlugVisibilityWhere()] },
    select: {
      title: true,
      titlePosition: true,
      subtitle: true,
      content: true,
      credits: true,
      publishedDate: true,
      heroImage: {
        select: { imageFile_id: true, imageFile_extension: true },
      },
      mobileHeroImage: {
        select: { imageFile_id: true, imageFile_extension: true },
      },
      relatedPostsOrderJson: true,
      relatedPosts: {
        where: buildPostBySlugVisibilityWhere(now),
        orderBy: [{ publishedDate: 'desc' }],
        select: relatedPostCardSelect,
      },
    },
  })
  if (!project) return null
  const relatedPostsOrdered = orderTargetsByOrderJson(
    project.relatedPosts as RelatedPostRow[],
    asOrderJson(project.relatedPostsOrderJson)
  ).map(mapRelatedPostOrdered)
  const result = {
    title: project.title,
    titlePosition: project.titlePosition,
    subtitle: project.subtitle,
    content: project.content,
    credits: project.credits,
    publishedDate: project.publishedDate?.toISOString(),
    heroImage: project.heroImage
      ? {
          resized: {
            small: buildResizedSmall(project.heroImage),
            medium: buildResizedMedium(project.heroImage),
            large: buildResizedLarge(project.heroImage),
          },
        }
      : undefined,
    mobileHeroImage: project.mobileHeroImage
      ? {
          resized: {
            small: buildResizedSmall(project.mobileHeroImage),
            medium: buildResizedMedium(project.mobileHeroImage),
            large: buildResizedLarge(project.mobileHeroImage),
          },
        }
      : undefined,
    relatedPostsOrdered,
  }
  return result
}

function newsReadingItemsOrderBy(
  raw: unknown
): Prisma.NewsReadingGroupItemOrderByWithRelationInput[] {
  const arr = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object'
      ? [raw]
      : [{ order: 'asc' }]
  return arr.map((o) => {
    if (!o || typeof o !== 'object') return { order: 'asc' }
    const r = o as Record<string, string>
    const out: Prisma.NewsReadingGroupItemOrderByWithRelationInput = {}
    if (r.order === 'asc' || r.order === 'desc') out.order = r.order
    if (r.id === 'asc' || r.id === 'desc') out.id = r.id
    if (r.name === 'asc' || r.name === 'desc') out.name = r.name
    return Object.keys(out).length ? out : { order: 'asc' }
  })
}

function postOrderByFromGraphQL(
  raw: unknown
): Prisma.PostOrderByWithRelationInput[] {
  const arr = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object'
      ? [raw]
      : [{ publishedDate: 'desc' }]
  return arr.map((o) => {
    if (!o || typeof o !== 'object') return { publishedDate: 'desc' }
    const r = o as Record<string, string>
    const out: Prisma.PostOrderByWithRelationInput = {}
    if (r.publishedDate === 'asc' || r.publishedDate === 'desc')
      out.publishedDate = r.publishedDate
    if (r.id === 'asc' || r.id === 'desc') out.id = r.id
    if (r.title === 'asc' || r.title === 'desc') out.title = r.title
    if (r.slug === 'asc' || r.slug === 'desc') out.slug = r.slug
    return Object.keys(out).length ? out : { publishedDate: 'desc' }
  })
}

export type PostDetailQueryOpts = {
  take: number
  postEssayQuestionsTake: number
  postChoiceQuestionsTake: number
}

export async function fetchPostDetailBySlug(
  slug: string,
  now: Date,
  opts: PostDetailQueryOpts
): Promise<V1PostDetailBody | null> {
  const where = buildPostBySlugVisibilityWhere(now)
  const newsReadingOrder = newsReadingItemsOrderBy([{ order: 'asc' }])
  const relatedPostsWhere: Prisma.PostWhereInput = { slug: { notIn: [slug] } }
  const post = await prisma.post.findFirst({
    where: { AND: [{ slug }, where] },
    select: {
      opening: true,
      title: true,
      showBaodaozai: true,
      brief: true,
      content: true,
      publishedDate: true,
      heroCaption: true,
      authorsJSON: true,
      TWReporterRelatedPostsJSON: true,
      subtitle: true,
      heroImage: {
        select: {
          imageFile_id: true,
          imageFile_extension: true,
          imageFile_width: true,
          imageFile_height: true,
        },
      },
      authors: {
        select: {
          id: true,
          bio: true,
          name: true,
          slug: true,
          avatar: {
            select: { imageFile_id: true, imageFile_extension: true },
          },
        },
      },
      tags: { select: { name: true, slug: true, id: true } },
      tagsOrderJson: true,
      relatedPosts: {
        where: { AND: [buildPublicPostWhere(now), relatedPostsWhere] },
        take: opts.take,
        orderBy: [{ publishedDate: 'desc' }],
        select: relatedPostCardSelect,
      },
      relatedPostsOrderJson: true,
      newsReadingGroup: {
        select: {
          items: {
            orderBy: newsReadingOrder,
            select: { name: true, embedCode: true },
          },
        },
      },
      mainProject: { select: { title: true, slug: true } },
      projects: {
        select: {
          title: true,
          slug: true,
          relatedPostsOrderJson: true,
          relatedPosts: {
            where: { AND: [buildPublicPostWhere(now), relatedPostsWhere] },
            take: opts.take,
            orderBy: [{ publishedDate: 'desc' }],
            select: projectNestedPostSelect,
          },
        },
      },
      postEssayQuestions: {
        take: opts.postEssayQuestionsTake,
        orderBy: { id: 'asc' },
        select: { id: true, title: true, hint: true },
      },
      postChoiceQuestions: {
        take: opts.postChoiceQuestionsTake,
        orderBy: { id: 'asc' },
        select: { id: true, title: true, options: true, reason: true },
      },
      subSubcategories: { select: subSubFullSelect },
      subSubcategoriesOrderJson: true,
    },
  })

  if (!post) return null

  const subSubcategoriesOrdered = orderTargetsByOrderJson(
    post.subSubcategories,
    asOrderJson(post.subSubcategoriesOrderJson)
  ).map(mapSubSubFull)

  const tagsOrdered = orderTargetsByOrderJson(
    post.tags,
    asOrderJson(post.tagsOrderJson)
  ).map((t) => ({ name: t.name, slug: t.slug }))

  const relatedPostsOrdered = orderTargetsByOrderJson(
    post.relatedPosts as RelatedPostRow[],
    asOrderJson(post.relatedPostsOrderJson)
  ).map(mapRelatedPostOrdered)

  const hero = post.heroImage
  const brief = post.brief
  const result = {
    opening: post.opening,
    title: post.title,
    showBaodaozai: post.showBaodaozai,
    newsReadingGroup: post.newsReadingGroup
      ? {
          items: post.newsReadingGroup.items.map((i) => ({
            name: i.name,
            embedCode: i.embedCode,
          })),
        }
      : undefined,
    brief,
    content: post.content,
    publishedDate: post.publishedDate
      ? post.publishedDate.toISOString()
      : undefined,
    heroImage: hero
      ? {
          imageFile: {
            width: hero.imageFile_width ?? 0,
            height: hero.imageFile_height ?? 0,
          },
          resized: {
            small: buildResizedSmall(hero),
            medium: buildResizedMedium(hero),
            large: buildResizedLarge(hero),
          },
        }
      : undefined,
    heroCaption: post.heroCaption,
    authors: post.authors.map((a) => ({
      id: String(a.id),
      bio: a.bio,
      name: a.name,
      slug: a.slug,
      avatar: a.avatar
        ? {
            resized: {
              tiny: buildResizedTiny(a.avatar),
            },
          }
        : undefined,
    })),
    authorsJSON: post.authorsJSON,
    tagsOrdered,
    TWReporterRelatedPostsJSON: post.TWReporterRelatedPostsJSON,
    relatedPostsOrdered,
    subtitle: post.subtitle,
    subSubcategoriesOrdered,
    mainProject: post.mainProject ?? undefined,
    projects: post.projects.map((proj) => {
      const nestedOrdered = orderTargetsByOrderJson(
        proj.relatedPosts as Prisma.PostGetPayload<{
          select: typeof projectNestedPostSelect
        }>[],
        asOrderJson(proj.relatedPostsOrderJson)
      )
      return {
        title: proj.title,
        slug: proj.slug,
        relatedPosts: nestedOrdered.map((rp) => ({
          title: rp.title,
          slug: rp.slug,
          ogDescription: rp.ogDescription,
          publishedDate: rp.publishedDate
            ? rp.publishedDate.toISOString()
            : undefined,
          heroImage: rp.heroImage
            ? {
                resized: {
                  small: buildResizedSmall(rp.heroImage),
                },
              }
            : undefined,
          subSubcategoriesOrdered: orderTargetsByOrderJson(
            rp.subSubcategories,
            asOrderJson(rp.subSubcategoriesOrderJson)
          ).map(mapSubSubProjectNested),
        })),
      }
    }),
    postEssayQuestions: post.postEssayQuestions.map((q) => ({
      id: String(q.id),
      title: q.title,
      hint: q.hint,
    })),
    postChoiceQuestions: post.postChoiceQuestions.map((q) => ({
      id: String(q.id),
      title: q.title,
      options: q.options,
      reason: q.reason,
    })),
  }
  return result
}

export async function fetchPostMetaBySlug(
  slug: string,
  now: Date
): Promise<V1PostMetaBody | null> {
  const where = buildPostBySlugVisibilityWhere(now)
  const post = await prisma.post.findFirst({
    where: { AND: [{ slug }, where] },
    select: {
      publishedDate: true,
      ogDescription: true,
      ogTitle: true,
      ogImage: {
        select: { imageFile_id: true, imageFile_extension: true },
      },
      subSubcategories: { select: subSubFullSelect },
      subSubcategoriesOrderJson: true,
    },
  })
  if (!post) return null
  const subSubcategoriesOrdered = orderTargetsByOrderJson(
    post.subSubcategories,
    asOrderJson(post.subSubcategoriesOrderJson)
  ).map(mapSubSubFull)
  const result = {
    publishedDate: post.publishedDate
      ? post.publishedDate.toISOString()
      : undefined,
    ogDescription: post.ogDescription,
    ogTitle: post.ogTitle,
    ogImage: post.ogImage
      ? {
          resized: {
            small: buildResizedSmall(post.ogImage),
          },
        }
      : null,
    subSubcategoriesOrdered,
  }
  return result
}

export async function fetchPostEssayQuestionsBySlug(
  slug: string,
  now: Date
): Promise<V1PostEssayQuestionsBody | null> {
  const where = buildPostBySlugVisibilityWhere(now)
  const post = await prisma.post.findFirst({
    where: { AND: [{ slug }, where] },
    select: {
      id: true,
      slug: true,
      title: true,
      heroImage: {
        select: { imageFile_id: true, imageFile_extension: true },
      },
      postEssayQuestions: {
        orderBy: { id: 'asc' },
        select: { id: true, title: true, hint: true },
      },
      subSubcategories: { select: { id: true, name: true } },
      subSubcategoriesOrderJson: true,
    },
  })
  if (!post) return null
  const subSubcategoriesOrdered = orderTargetsByOrderJson(
    post.subSubcategories,
    asOrderJson(post.subSubcategoriesOrderJson)
  ).map((s) => ({ name: s.name }))
  const result = {
    id: String(post.id),
    slug: post.slug,
    title: post.title,
    heroImage: post.heroImage
      ? {
          resized: {
            medium: buildResizedMedium(post.heroImage),
          },
        }
      : undefined,
    postEssayQuestions: post.postEssayQuestions.map((q) => ({
      id: String(q.id),
      title: q.title,
      hint: q.hint,
    })),
    subSubcategoriesOrdered,
  }
  return result
}

export type EssayAnswersWithLikesQueryOpts = {
  take: number
  skip: number
  orderBy: Prisma.PostOrderByWithRelationInput[]
  answerTake: number
  answerOrderBy: 'createdAt:desc' | 'likesCount:desc'
  where: Prisma.PostWhereInput
}

export async function fetchPostsEssayAnswersWithLikes(
  opts: EssayAnswersWithLikesQueryOpts,
  now: Date
): Promise<V1PostsEssayAnswersWithLikesResponse> {
  const where: Prisma.PostWhereInput = {
    AND: [buildPublicPostWhere(now), opts.where],
  }
  const posts = await prisma.post.findMany({
    where,
    orderBy: postOrderByFromGraphQL(opts.orderBy),
    take: opts.take,
    skip: opts.skip,
    select: {
      id: true,
      title: true,
      slug: true,
      heroImage: {
        select: { imageFile_id: true, imageFile_extension: true },
      },
      subSubcategories: { select: { id: true, name: true } },
      subSubcategoriesOrderJson: true,
      postEssayQuestions: {
        select: {
          id: true,
          title: true,
          hint: true,
          answers: {
            orderBy: essayAnswerOrderByFromFlat(opts.answerOrderBy),
            take: opts.answerTake,
            select: {
              id: true,
              content: true,
              likesCount: true,
              createdAt: true,
              member: {
                select: {
                  id: true,
                  name: true,
                  nickname: true,
                  email: true,
                  avatar: {
                    select: {
                      id: true,
                      imageFile_id: true,
                      imageFile_extension: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  const result = posts.map((p) => ({
    id: String(p.id),
    title: p.title,
    slug: p.slug,
    heroImage: p.heroImage
      ? {
          resized: {
            medium: buildResizedMedium(p.heroImage),
          },
        }
      : undefined,
    subSubcategoriesOrdered: orderTargetsByOrderJson(
      p.subSubcategories as PostCardRow['subSubcategories'],
      asOrderJson(p.subSubcategoriesOrderJson)
    ).map((s) => ({ name: s.name })),
    postEssayQuestions: p.postEssayQuestions.map((q) => ({
      id: String(q.id),
      title: q.title,
      hint: q.hint,
      answers: q.answers.map((a) => ({
        id: String(a.id),
        content: a.content,
        likesCount: a.likesCount,
        member: a.member
          ? {
              id: String(a.member.id),
              name: a.member.name,
              nickname: a.member.nickname,
              email: maskEmail(a.member.email),
              avatar: a.member.avatar
                ? {
                    id: String(a.member.avatar.id),
                    fileUrl: buildMemberAvatarFileUrl(a.member.avatar),
                  }
                : undefined,
            }
          : undefined,
      })),
    })),
  }))
  return result
}
