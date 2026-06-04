import type express from 'express'

export function asyncRoute(
  fn: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => Promise<void>
): express.RequestHandler {
  return (req, res, next) => {
    void fn(req, res, next).catch(next)
  }
}
