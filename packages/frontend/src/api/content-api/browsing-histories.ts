import type {
  CreateBrowsingHistoryResponse,
  MemberBrowsingHistoriesResponse,
  V1CreateBrowsingHistoryBody,
} from '@/types/api'
import type { TraceHeaders } from '@/types/trace-headers'
import { sendContentApiRequest } from '@/utils/send-content-api'

export type BrowsingHistoryType = V1CreateBrowsingHistoryBody['type']

function assertBrowsingHistoriesResponse(
  data: MemberBrowsingHistoriesResponse | null | undefined
): MemberBrowsingHistoriesResponse {
  if (!data || !Array.isArray(data.browsingHistories)) {
    throw new Error('content-api invalid browsing histories response')
  }
  return data
}

export async function listBrowsingHistoriesContentApi({
  accessToken,
  take,
  skip,
  traceHeaders,
}: {
  accessToken: string
  take: number
  skip: number
  traceHeaders?: TraceHeaders
}): Promise<MemberBrowsingHistoriesResponse> {
  const data = await sendContentApiRequest<MemberBrowsingHistoriesResponse>({
    path: '/v1/members/me/browsing-histories',
    method: 'GET',
    authToken: accessToken,
    query: { take, skip },
    traceHeaders,
  })
  return assertBrowsingHistoriesResponse(data)
}

export async function createBrowsingHistoryContentApi(
  body: V1CreateBrowsingHistoryBody,
  accessToken: string,
  traceHeaders?: TraceHeaders
): Promise<CreateBrowsingHistoryResponse> {
  return sendContentApiRequest<CreateBrowsingHistoryResponse>({
    path: '/v1/members/me/browsing-histories',
    method: 'POST',
    authToken: accessToken,
    body,
    traceHeaders,
  })
}
