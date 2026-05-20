import {
  GetAuthorAvatarQuery,
  GetAuthorMetaQuery,
  GetAuthorPostsQuery,
  GetAuthorPostsQueryVariables,
} from '__generated__/operations/content.generated'

import { getAuthorAvatarBySlugContentApi } from '@/api/content-api/author-avatar'
import {
  getAuthorMetaContentApi,
  getAuthorPostsContentApi,
} from '@/api/content-api/author-collection'
import { DEFAULT_AVATAR } from '@/constants'
import envVars from '@/environment-variables'
import type { TraceHeaders } from '@/types/trace-headers'
import { firstOrderByEntry } from '@/utils/first-order-by'
import { logContentApiFallback } from '@/utils/log-content-api-fallback'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export async function getAuthorAvatarBySlug({
  slug,
  traceHeaders,
}: {
  slug: string
  traceHeaders?: TraceHeaders
}): Promise<string> {
  if (envVars.useContentApi) {
    try {
      const tiny = await getAuthorAvatarBySlugContentApi({ slug, traceHeaders })
      return tiny || DEFAULT_AVATAR
    } catch (err) {
      logContentApiFallback('getAuthorAvatarBySlug', err)
    }
  }

  const res = await sendRestGqlRequest<GetAuthorAvatarQuery>({
    operation: 'author-avatar',
    method: 'GET',
    variables: {
      where: {
        slug,
      },
    },
    traceHeaders,
  })

  return res?.data?.data?.author?.avatar?.resized?.tiny ?? DEFAULT_AVATAR
}

export async function getAuthorMetaBySlug({
  slug,
  traceHeaders,
}: {
  slug: string
  traceHeaders?: TraceHeaders
}): Promise<GetAuthorMetaQuery['author']> {
  if (envVars.useContentApi) {
    try {
      return await getAuthorMetaContentApi({ slug, traceHeaders })
    } catch (err) {
      logContentApiFallback('getAuthorMetaBySlug', err)
    }
  }
  const res = await sendRestGqlRequest<GetAuthorMetaQuery>({
    operation: 'author-meta',
    method: 'GET',
    variables: {
      where: {
        slug,
      },
    },
    traceHeaders,
  })

  return res?.data?.data?.author
}

export async function getAuthorPostsBySlugPaged(
  variables: GetAuthorPostsQueryVariables,
  traceHeaders?: TraceHeaders
): Promise<GetAuthorPostsQuery['author']> {
  const slug = variables.where?.slug
  const order = firstOrderByEntry(variables.orderBy ?? undefined)
  const orderOk =
    !order ||
    (order.publishedDate === 'desc' && !order.id && !order.title && !order.slug)

  if (envVars.useContentApi && slug && orderOk) {
    try {
      return await getAuthorPostsContentApi({
        slug,
        take: variables.take ?? undefined,
        skip: variables.skip ?? undefined,
        orderBy: 'publishedDate:desc',
        traceHeaders,
      })
    } catch (err) {
      logContentApiFallback('getAuthorPostsBySlugPaged', err)
    }
  }

  const res = await sendRestGqlRequest<GetAuthorPostsQuery>({
    operation: 'author-posts',
    method: 'GET',
    variables,
    traceHeaders,
  })

  return res?.data?.data?.author
}
