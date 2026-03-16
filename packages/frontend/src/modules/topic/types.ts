import { GetProjectsQuery } from '__generated__/operations/content.generated'

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
  relatedPosts?: NonNullable<
    GetProjectsQuery['projects']
  >[number]['relatedPostsOrdered']
}
