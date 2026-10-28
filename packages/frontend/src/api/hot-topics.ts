import { getHotTopicsContentApi } from '@/api/content-api/hot-topics'

export const getHotTopics = async (traceHeaders?: Record<string, string>) => {
  return getHotTopicsContentApi({ traceHeaders })
}
