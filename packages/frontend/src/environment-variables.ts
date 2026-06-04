const apiGatewayEndpoint =
  process.env.NEXT_PUBLIC_API_GATEWAY_ENDPOINT || 'http://localhost:3000'
const internalApiGatewayEndpoint =
  process.env.INTERNAL_API_GATEWAY_ENDPOINT || apiGatewayEndpoint

const contentApiEndpoint =
  process.env.NEXT_PUBLIC_CONTENT_API_ENDPOINT || apiGatewayEndpoint
const internalContentApiEndpoint =
  process.env.INTERNAL_CONTENT_API_ENDPOINT || contentApiEndpoint

const isProduction = process.env.NEXT_PUBLIC_RELEASE_ENV === 'prod'
const isStaging = process.env.NEXT_PUBLIC_RELEASE_ENV === 'staging'

const searchAPIKey = process.env.SEARCH_API_KEY || ''
const searchEngineID = process.env.SEARCH_ENGINE_ID || ''

const mockIdToken = process.env.MOCK_ID_TOKEN || ''

const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL || '/login'
const loginWidgetUrl =
  process.env.NEXT_PUBLIC_LOGIN_WIDGET_URL ||
  'https://accounts.twreporter.org/signin-widget'

const baodaozaiRiveFilePath =
  process.env.NEXT_PUBLIC_BAODAOZAI_RIVE_FILE_PATH ||
  'https://kids-storage.twreporter.org/callinbaodaozai.riv'

const nodeEnv = process.env.NODE_ENV

const isPreviewMode = process.env.NEXT_PUBLIC_IS_PREVIEW_MODE === 'true'
const rawRequestTimeoutMs = Number(process.env.NEXT_PUBLIC_REQUEST_TIMEOUT_MS)

const requestTimeoutMs =
  Number.isFinite(rawRequestTimeoutMs) && rawRequestTimeoutMs >= 0
    ? rawRequestTimeoutMs
    : 10000

const environmentVariables = {
  internalApiGatewayEndpoint,
  apiGatewayEndpoint,
  internalContentApiEndpoint,
  contentApiEndpoint,
  isProduction,
  isStaging,
  searchAPIKey,
  searchEngineID,
  mockIdToken,
  loginUrl,
  loginWidgetUrl,
  nodeEnv,
  baodaozaiRiveFilePath,
  isPreviewMode,
  requestTimeoutMs,
}

export default environmentVariables
