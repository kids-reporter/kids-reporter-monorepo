import { AuthorRole } from '@/constants'

export type Author = {
  id: string
  slug: string | undefined
  name: string
  avatar: string
  role: AuthorRole
  roleName?: string
  bio: string
}
