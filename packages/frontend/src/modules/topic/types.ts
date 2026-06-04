import type { ProjectListItem } from '@/types/api'

export type TitlePosition =
  | 'center'
  | 'center-bottom'
  | 'left-center'
  | 'left-bottom'

export type TopicSummary = {
  image: string
  title: string
  url: string
  desc: string
  publishedDate: string
  relatedPosts?: NonNullable<ProjectListItem['relatedPostsOrdered']>
}
