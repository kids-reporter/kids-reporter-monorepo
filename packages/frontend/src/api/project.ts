import {
  GetProjectsQuery,
  GetProjectsQueryVariables,
  GetTopicProjectsQuery,
  GetTopicProjectsQueryVariables,
} from '__generated__/operations/content.generated'

import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export const getTopicProjects = async (
  variables: GetTopicProjectsQueryVariables,
  traceHeaders?: Record<string, string>
) => {
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
