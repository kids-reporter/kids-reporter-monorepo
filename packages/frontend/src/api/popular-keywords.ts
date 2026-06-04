import { getPopularKeywordsContentApi } from '@/api/content-api/popular-keywords'
import type { PopularKeyword } from '@/types/api'

export const getPopularKeywords = async (
  _variables?: Record<string, never>,
  traceHeaders?: Record<string, string>
): Promise<PopularKeyword[]> => {
  return getPopularKeywordsContentApi({ traceHeaders })
}
