import { CallBaodaozaiIntroPageType } from '__generated__/types'

import { CategorySlug } from '@/types'

const isValidPageNumber = (pageNumber: string): boolean => {
  return Number.isInteger(Number(pageNumber)) && Number(pageNumber) > 0
}

const isValidCategorySlug = (category: string): category is CategorySlug => {
  return [
    'news',
    'storytelling',
    'campus',
    'listening-news',
    'classroom',
  ].includes(category)
}

export const parseCategoryInfoFromPath = (
  path: string[] | undefined
): {
  category?: CategorySlug
  subcategory?: string
  subSubcategory?: string
  currentPage?: number
  isNotFound?: boolean
} => {
  if (!path || !Array.isArray(path) || path.length === 0) {
    return {
      isNotFound: true,
    }
  }
  const [category, subcategory, subSubcategory] = path

  if (!isValidCategorySlug(category)) {
    return {
      isNotFound: true,
    }
  }

  if (path.length === 1) {
    return {
      category,
    }
  }
  if (path.length === 2) {
    // /category/news/times
    return {
      category,
      subcategory,
    }
  }

  if (path.length === 3) {
    if (subcategory === 'page' && isValidPageNumber(path[2])) {
      // /category/news/page/2
      return {
        category,
        currentPage: Number(path[2]),
      }
    }

    // /category/news/times/medical-news
    return {
      category,
      subcategory,
      subSubcategory,
    }
  }

  if (
    path.length === 4 &&
    subSubcategory === 'page' &&
    isValidPageNumber(path[3])
  ) {
    // /category/news/times/page/2
    return {
      category,
      subcategory,
      currentPage: Number(path[3]),
    }
  }

  if (path.length === 5 && path[3] === 'page' && isValidPageNumber(path[4])) {
    // /category/news/times/medical-news/page/2
    return {
      category,
      subcategory,
      subSubcategory,
      currentPage: Number(path[4]),
    }
  }

  return {
    isNotFound: true,
  }
}

export const mapCategorySlugToIntroPageType = (
  category?: CategorySlug
): CallBaodaozaiIntroPageType | undefined => {
  /**
   * news -> category/news
   * storytelling -> category/storytelling
   * campus -> category/campus
   * listeningNews -> category/listening-news
   * default -> undefined
   */
  if (!category) return undefined
  switch (category) {
    case 'news':
      return 'news'
    case 'storytelling':
      return 'storytelling'
    case 'campus':
      return 'campus'
    case 'listening-news':
      return 'listeningNews'
    case 'classroom':
      return 'classroom'
    default:
      return undefined
  }
}
