import { emitStructured } from '@kids-reporter/logger'

const {
  GCP_PROJECT_ID,
  CORS_ALLOW_ORIGINS,
  GO_API_ENV,
  REQUEST_TIMEOUT_MS,
  GCS_ORIGIN,
  GO_API_JWT_SECRET,
  GO_API_JWT_ISSUER,
  GO_API_JWT_AUDIENCE,
  IMAGES_STORAGE_PATH,
  IS_PREVIEW_SERVER,
} = process.env

const isPreviewServer = IS_PREVIEW_SERVER === 'true'

const parsedRequestTimeoutMs = Number(REQUEST_TIMEOUT_MS)
const requestTimeoutMs =
  Number.isFinite(parsedRequestTimeoutMs) && parsedRequestTimeoutMs >= 0
    ? parsedRequestTimeoutMs
    : 10000

const getAllowOrigins = (cors: string) => {
  if (cors === '*') {
    return '*'
  } else if (typeof cors === 'string' && cors.trim()) {
    return cors
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
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
    goApi: {
      origin:
        GO_API_ENV === 'prod'
          ? 'https://go-api.twreporter.org'
          : 'https://staging-go-api.twreporter.org',
    },
    requestTimeoutMs,
  },
  cors: {
    allowOrigins: getAllowOrigins(CORS_ALLOW_ORIGINS || ''),
  },
  gcs: {
    origin: GCS_ORIGIN || 'http://localhost:3000',
  },
  goApiJwt: {
    secret: GO_API_JWT_SECRET || '',
    issuer: GO_API_JWT_ISSUER || 'https://go-api.twreporter.org',
    audience: GO_API_JWT_AUDIENCE || 'https://www.twreporter.org',
  },
  images: {
    /** Local filesystem root for Keystone `images` storage (member avatars). */
    storagePath: IMAGES_STORAGE_PATH || '',
  },
  isPreviewServer,
}

if (envVar.cors.allowOrigins === '*') {
  emitStructured({
    severity: 'WARNING',
    message:
      'CORS_ALLOW_ORIGINS is *: public routes allow any origin; /auth/* requires an explicit allowlist and will reject *.',
  })
}

export default envVar
