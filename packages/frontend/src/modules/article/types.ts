import { AuthorRole } from '@/constants'
import { PostDetail } from '@/types/api'
import { RecursiveNonNullable } from '@/types/utils'

export type AuthorGroup = {
  title: string
  authors: {
    name: string
    link: string
  }[]
}

export type Keyword = RecursiveNonNullable<PostDetail>['tagsOrdered'][number]

export type Author = Omit<
  RecursiveNonNullable<PostDetail>['authors'][number],
  'slug' | 'avatar'
> & {
  role: AuthorRole
  roleName?: string
  slug?: string
  avatar: string
}
