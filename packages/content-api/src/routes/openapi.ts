import { getOpenApiDocument } from '@kids-reporter/api-types'
import express from 'express'
import swaggerUi from 'swagger-ui-express'

export function createOpenApiRouter({ basePath = '' } = {}) {
  const router = express.Router()
  const swaggerSetup = swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: `${basePath}/openapi.json`,
    },
  })

  const openApiDoc = {
    ...getOpenApiDocument(),
    servers: [{ url: basePath || '/', description: 'Content API' }],
  }
  router.get('/openapi.json', (_req, res) => {
    res.set('Cache-Control', 'no-store')
    res.json(openApiDoc)
  })

  router.use('/docs', swaggerUi.serve, swaggerSetup)

  return router
}
