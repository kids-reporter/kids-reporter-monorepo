const {
  GCP_PROJECT_ID,
  CORS_ALLOW_ORIGINS,
  GQL_ORIGIN,
  GQL_HEADLESS_ACCOUNT_EMAIL,
  GQL_HEADLESS_ACCOUNT_PASSWORD,
  GO_API_ENV,
  REQUEST_TIMEOUT_MS,
} = process.env

const parsedRequestTimeoutMs = Number(REQUEST_TIMEOUT_MS)
const requestTimeoutMs =
  Number.isFinite(parsedRequestTimeoutMs) && parsedRequestTimeoutMs >= 0
    ? parsedRequestTimeoutMs
    : 10000

const getAllowOrigins = (cors: string) => {
  if (cors === '*') {
    return '*'
  } else if (typeof cors === 'string') {
    return cors.split(',')
  } else {
    return [
      'https://kids.twreporter.org',
      'https://dev-kids.twreporter.org',
      'https://staging-kids.twreporter.org',
    ]
  }
}
const envVar = {
  gcp: {
    projectId: GCP_PROJECT_ID || 'kids-reporter',
  },
  apis: {
    gql: {
      origin: GQL_ORIGIN || 'http://localhost:3000',
      headlessAccount: {
        email: GQL_HEADLESS_ACCOUNT_EMAIL || '',
        password: GQL_HEADLESS_ACCOUNT_PASSWORD || '',
      },
    },
    goApi: {
      origin:
        GO_API_ENV === 'prod'
          ? 'https://go-api.twreporter.org'
          : GO_API_ENV === 'staging'
            ? 'https://staging-go-api.twreporter.org'
            : 'http://localhost:8080',
    },
    requestTimeoutMs,
  },
  cors: {
    allowOrigins: getAllowOrigins(CORS_ALLOW_ORIGINS || ''),
  },
}

export default envVar
