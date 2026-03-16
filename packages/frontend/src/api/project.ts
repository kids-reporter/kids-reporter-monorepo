import {
  GetProjectsQuery,
  GetProjectsQueryVariables,
  GetTopicProjectsQuery,
  GetTopicProjectsQueryVariables,
} from '__generated__/operations/content.generated'

import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export const getTopicProjects = async (
  variables: GetTopicProjectsQueryVariables
) => {
  const response = await sendRestGqlRequest<GetTopicProjectsQuery>({
    operation: 'topic-projects',
    method: 'GET',
    variables,
  })

  return response?.data?.data?.projects
}

export const getTopicProjectsPaged = async (
  variables: GetProjectsQueryVariables
) => {
  const response = await sendRestGqlRequest<GetProjectsQuery>({
    operation: 'projects-paged',
    method: 'GET',
    variables,
  })

  return {
    projects: response?.data?.data?.projects,
    projectsCount: response?.data?.data?.projectsCount,
  }
}
