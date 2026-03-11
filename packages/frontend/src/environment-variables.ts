const apiGatewayEndpoint =
  process.env.NEXT_PUBLIC_API_GATEWAY_ENDPOINT || 'http://localhost:3000'
const internalApiGatewayEndpoint =
  process.env.INTERNAL_API_GATEWAY_ENDPOINT || apiGatewayEndpoint

const isProduction = process.env.NEXT_PUBLIC_RELEASE_ENV === 'prod'

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

const environmentVariables = {
  internalApiGatewayEndpoint,
  apiGatewayEndpoint,
  isProduction,
  searchAPIKey,
  searchEngineID,
  mockIdToken,
  loginUrl,
  loginWidgetUrl,
  nodeEnv,
  baodaozaiRiveFilePath,
}

export default environmentVariables
