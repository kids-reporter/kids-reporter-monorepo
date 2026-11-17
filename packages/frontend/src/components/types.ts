export type PostSummary = {
  image: string
  title: string
  url: string
  desc: string
  category: string
  subSubcategory: string
  publishedDate: string
  externalUrl?: string
  videoDuration?: string
}

export enum Loading {
  LAZY = 'lazy',
  EAGER = 'eager',
}
