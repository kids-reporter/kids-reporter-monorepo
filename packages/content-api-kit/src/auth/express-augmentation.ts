/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-namespace -- Express module augmentation uses namespace Express */
declare global {
  namespace Express {
    interface Request {
      goApiJwtUserId?: string
    }
  }
}

export {}
