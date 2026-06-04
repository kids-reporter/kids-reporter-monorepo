import { getTopicProjectsContentApi } from '@/api/content-api/project'
import { getProjectsListContentApi } from '@/api/content-api/projects-paged'
import type {
  ProjectListItem,
  ProjectsListResponse,
  V1ProjectsQuery,
} from '@/types/api'

export const getTopicProjects = async (
  variables: Pick<V1ProjectsQuery, 'take'>,
  traceHeaders?: Record<string, string>
): Promise<ProjectListItem[] | undefined> => {
  return getTopicProjectsContentApi({
    take: variables.take ?? undefined,
    traceHeaders,
  })
}

export const getTopicProjectsPaged = async (
  variables: V1ProjectsQuery & { includeRelatedPosts?: boolean | null },
  traceHeaders?: Record<string, string>
) => {
  const data = await getProjectsListContentApi({
    take: variables.take ?? undefined,
    skip: variables.skip ?? undefined,
    includeRelatedPosts: variables.includeRelatedPosts ?? undefined,
    traceHeaders,
  })
  return {
    projects: data.projects,
    projectsCount: data.projectsCount,
  } satisfies Pick<ProjectsListResponse, 'projects' | 'projectsCount'> & {
    projects: ProjectListItem[] | undefined
    projectsCount: number | undefined
  }
}
