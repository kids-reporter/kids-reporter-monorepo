import { Photo } from '@/types'

type Category = {
  name: string
  slug: string
}

type Subcategory = {
  slug: string
  category: Category
}

type SubSubcategory = {
  name: string
  slug: string
  subcategory: Subcategory
}

export type Post = {
  title: string
  slug: string
  publishedDate: string
  ogDescription?: string
  heroImage: Photo | null
  subSubcategories: SubSubcategory[]
}
