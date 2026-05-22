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

  router.get('/openapi.json', (_req, res) => {
    res.set('Cache-Control', 'no-store')
    res.json(getOpenApiDocument())
  })

  router.use('/docs', swaggerUi.serve, swaggerSetup)

  return router
}
