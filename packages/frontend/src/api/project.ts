import {
  GetProjectsQuery,
  GetProjectsQueryVariables,
  GetTopicProjectsQuery,
  GetTopicProjectsQueryVariables,
} from '__generated__/operations/content.generated'

import { getTopicProjectsContentApi } from '@/api/content-api/project'
import { getProjectsListContentApi } from '@/api/content-api/projects-paged'
import envVars from '@/environment-variables'
import { firstOrderByEntry } from '@/utils/first-order-by'
import { logContentApiFallback } from '@/utils/log-content-api-fallback'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export const getTopicProjects = async (
  variables: GetTopicProjectsQueryVariables,
  traceHeaders?: Record<string, string>
): Promise<GetTopicProjectsQuery['projects']> => {
  if (envVars.useContentApi) {
    try {
      const projects = await getTopicProjectsContentApi({
        take: variables.take ?? undefined,
        traceHeaders,
      })
      return projects as unknown as GetTopicProjectsQuery['projects']
    } catch (err) {
      logContentApiFallback('getTopicProjects', err)
    }
  }
  const response = await sendRestGqlRequest<GetTopicProjectsQuery>({
    operation: 'topic-projects',
    method: 'GET',
    variables,
    traceHeaders,
  })

  return response?.data?.data?.projects
}

export const getTopicProjectsPaged = async (
  variables: GetProjectsQueryVariables,
  traceHeaders?: Record<string, string>
) => {
  if (envVars.useContentApi) {
    try {
      const order = firstOrderByEntry(variables.orderBy ?? undefined)
      const orderSupported =
        !order ||
        (order.publishedDate === 'desc' &&
          !order.id &&
          !order.title &&
          !order.slug)

      if (orderSupported) {
        const data = await getProjectsListContentApi({
          take: variables.take ?? undefined,
          skip: variables.skip ?? undefined,
          includeRelatedPosts: variables.includeRelatedPosts ?? undefined,
          traceHeaders,
        })
        return {
          projects: data.projects as unknown as GetProjectsQuery['projects'],
          projectsCount: data.projectsCount,
        }
      }
    } catch (err) {
      logContentApiFallback('getTopicProjectsPaged', err)
    }
  }

  const response = await sendRestGqlRequest<GetProjectsQuery>({
    operation: 'projects-paged',
    method: 'GET',
    variables,
    traceHeaders,
  })

  return {
    projects: response?.data?.data?.projects,
    projectsCount: response?.data?.data?.projectsCount,
  }
}
