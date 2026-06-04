import { getEditorPicksSettingsContentApi } from '@/api/content-api/editor-picks-settings'
import type { EditorPicksSettingsResponse } from '@/types/api'

export const getEditorPicksSettings = async (
  variables: { take?: number | null },
  traceHeaders?: Record<string, string>
): Promise<EditorPicksSettingsResponse | undefined> => {
  return getEditorPicksSettingsContentApi({
    take: variables.take ?? undefined,
    traceHeaders,
  })
}
