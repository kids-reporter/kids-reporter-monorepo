import { useQuery } from '@tanstack/react-query'

import { getAuthorAvatarBySlug } from '@/api/author'
import { DEFAULT_AVATAR } from '@/constants'

const AUTHOR_AVATAR_QUERY_KEY = 'author-avatar'

export function useAuthorAvatarQuery({
  slug,
  avatar,
}: {
  slug: string | undefined
  avatar: string | undefined
}) {
  const hasProvidedAvatar = Boolean(avatar)

  return useQuery({
    queryKey: useAuthorAvatarQuery.getQueryKey({ slug }),
    queryFn: async () => {
      if (!slug) return DEFAULT_AVATAR
      return getAuthorAvatarBySlug({ slug })
    },
    enabled: Boolean(slug) && !hasProvidedAvatar,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

useAuthorAvatarQuery.getQueryKey = ({ slug }: { slug: string | undefined }) => [
  AUTHOR_AVATAR_QUERY_KEY,
  slug,
]
