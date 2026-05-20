import type { NextFunction, Request, RequestHandler, Response } from 'express'

/**
 * Express 4 does not forward rejected promises from async route handlers to the
 * error middleware. Wrap handlers so ZodError and Prisma failures reach `next(err)`.
 */
export const asyncRoute =
  (
    handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
  ): RequestHandler =>
  (req, res, next) => {
    void handler(req, res, next).catch(next)
  }
