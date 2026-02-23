import express from 'express'

/**
 * Health check endpoint for Cloud Run readiness and liveness probes
 */
export function createHealthRouter() {
  const router = express.Router()

  router.get('/health', (req, res) => {
    res.status(200).json({
      status: 'success',
      timestamp: new Date().toISOString(),
    })
  })

  return router
}
