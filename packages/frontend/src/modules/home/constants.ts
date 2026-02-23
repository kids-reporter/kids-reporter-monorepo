import { CategorySlug } from '@/types'

export const CATEGORY_CONFIG: { slug: CategorySlug; name: string }[] = [
  {
    slug: 'storytelling',
    name: '多媒體',
  },
  {
    slug: 'campus',
    name: '校園',
  },
  {
    slug: 'listening-news',
    name: 'Podcast',
  },
  {
    slug: 'classroom',
    name: '教案',
  },
] as const
