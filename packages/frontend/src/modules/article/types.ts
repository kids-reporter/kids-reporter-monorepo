import { GetPostQuery } from '__generated__/operations/content.generated'

import { AuthorRole } from '@/constants'
import { RecursiveNonNullable } from '@/types/utils'

export type AuthorGroup = {
  title: string
  authors: {
    name: string
    link: string
  }[]
}

export type Keyword = RecursiveNonNullable<
  GetPostQuery['post']
>['tagsOrdered'][number]

export type Author = Omit<
  RecursiveNonNullable<GetPostQuery['post']>['authors'][number],
  'slug' | 'avatar'
> & {
  role: AuthorRole
  roleName?: string
  slug?: string
  avatar: string
}
