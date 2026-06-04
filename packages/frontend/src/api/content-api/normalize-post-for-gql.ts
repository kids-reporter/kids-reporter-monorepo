import type { PostContent } from '@kids-reporter/api-types'

type ParsedPost = PostContent
type ParsedSubSub = ParsedPost['subSubcategoriesOrdered'][number]
type ParsedSubcat = NonNullable<ParsedSubSub['subcategory']>
type ParsedCat = NonNullable<ParsedSubcat['category']>

const normalizeCategoryNested = (
  category: ParsedCat | null | undefined
): (Omit<ParsedCat, 'themeColor'> & { themeColor?: string }) | undefined => {
  if (category == null) return undefined
  return {
    slug: category.slug,
    themeColor: category.themeColor ?? undefined,
  }
}

const normalizeSubcategoryNested = (
  subcategory: ParsedSubcat | null | undefined
):
  | (Omit<ParsedSubcat, 'category'> & {
      category?: ReturnType<typeof normalizeCategoryNested>
    })
  | undefined => {
  if (subcategory == null) return undefined
  return {
    name: subcategory.name,
    category: normalizeCategoryNested(subcategory.category ?? undefined),
  }
}

/** Content-api Zod allows `null`; GraphQL consumer types expect optional fields without `null`. */
export function normalizePostCardForGql(post: ParsedPost) {
  return {
    ...post,
    ogDescription: post.ogDescription ?? undefined,
    heroImage: post.heroImage ?? undefined,
    publishedDate: post.publishedDate ?? undefined,
    subSubcategoriesOrdered: post.subSubcategoriesOrdered.map((row) => ({
      name: row.name,
      subcategory: normalizeSubcategoryNested(row.subcategory ?? undefined),
    })),
  }
}

export function normalizePostCardsForGql(posts: ParsedPost[]) {
  return posts.map(normalizePostCardForGql)
}
