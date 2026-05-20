import {
  GetEditorPicksSettingsQuery,
  GetEditorPicksSettingsQueryVariables,
} from '__generated__/operations/content.generated'

import { getEditorPicksSettingsContentApi } from '@/api/content-api/editor-picks-settings'
import envVars from '@/environment-variables'
import { logContentApiFallback } from '@/utils/log-content-api-fallback'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export const getEditorPicksSettings = async (
  variables: GetEditorPicksSettingsQueryVariables,
  traceHeaders?: Record<string, string>
) => {
  if (envVars.useContentApi) {
    try {
      const settings = await getEditorPicksSettingsContentApi({
        take: variables.take ?? undefined,
        traceHeaders,
      })
      return settings as GetEditorPicksSettingsQuery['editorPicksSettings']
    } catch (err) {
      logContentApiFallback('getEditorPicksSettings', err)
    }
  }
  const response = await sendRestGqlRequest<GetEditorPicksSettingsQuery>({
    operation: 'editor-picks-settings',
    method: 'GET',
    variables,
    traceHeaders,
  })
  return response?.data?.data?.editorPicksSettings
}
