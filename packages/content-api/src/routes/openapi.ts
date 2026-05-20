import { getOpenApiDocument } from '@kids-reporter/api-types'
import express from 'express'
import swaggerUi from 'swagger-ui-express'

export function createOpenApiRouter() {
  const router = express.Router()

  router.get('/openapi.json', (_req, res) => {
    res.set('Cache-Control', 'no-store')
    res.json(getOpenApiDocument())
  })

  router.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      swaggerOptions: {
        url: '/openapi.json',
      },
    })
  )

  return router
}
