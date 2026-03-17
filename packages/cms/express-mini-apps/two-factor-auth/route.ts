import { KeystoneContext } from '@keystone-6/core/types'
import { emitStructured } from '@kids-reporter/logger'
// @ts-ignore twreporter errors is not typed
import _errors from '@twreporter/errors'
import { CookieOptions, Express } from 'express'
import { sign } from 'jsonwebtoken'
import { authenticator } from 'otplib'
import qrcode from 'qrcode'

import appConfig from '../../config'
import { verify2FAJWT } from './index'

const cookieName2fa = appConfig.twoFactorAuth.cookieName

authenticator.options = {
  window: 1,
}

const errors = _errors.default

function sessionExpireTime() {
  return new Date(new Date().getTime() + appConfig.session.maxAge * 1000)
}

function twoFactorAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true, // Prevent JavaScript access
    secure: true, // Secure flag for HTTPS only
    sameSite: 'lax', // CSRF protection
    expires: sessionExpireTime(),
  }
}

function issue2FAJWT(userId: string) {
  const secret = appConfig.twoFactorAuth.secret

  const payload = {
    userId: userId,
    twoFactorExpire: sessionExpireTime(),
  }

  const jwtToken = sign(payload, secret, {
    expiresIn: `${appConfig.session.maxAge * 1000}s`,
  })

  return jwtToken
}

export function twoFactorAuthRoute(
  app: Express,
  commonContext: KeystoneContext
) {
  if (!appConfig.twoFactorAuth.enable) {
    app.get('/2fa-verify', async (req, res) => {
      return res.redirect('/')
    })
    app.get('/2fa-setup', async (req, res) => {
      return res.redirect('/')
    })
  } else {
    // generate secret and get QR code
    app.get('/api/2fa/setup', async (req, res) => {
      const context = await commonContext.withRequest(req, res)

      if (
        context.session?.data.twoFactorAuth.set &&
        (!req.cookies[cookieName2fa] ||
          !verify2FAJWT(req.cookies[cookieName2fa], context.session.itemId))
      ) {
        res
          .status(403)
          .send({ status: 'fail', data: { session: 'invalid 2fa' } })
        return
      }

      const currentSession = context?.session
      if (!currentSession) {
        res
          .status(403)
          .send({ status: 'fail', data: { session: 'no session' } })
        return
      }
      const tempSecret = authenticator.generateSecret()
      // save tempSecret to user table column twoFactorAuthTemp
      try {
        await context.prisma.User.update({
          where: { id: currentSession?.itemId },
          data: {
            twoFactorAuthTemp: tempSecret,
          },
        })
      } catch (error) {
        const annotatedErr = errors.helpers.wrap(
          error,
          'get2faSetup',
          'Failed to save tempSecret to user table'
        )
        emitStructured({
          severity: 'ERROR',
          message: errors.helpers.printAll(
            annotatedErr,
            { withStack: true, withPayload: true },
            0,
            0
          ),
        })
        res.status(500).send({
          status: 'error',
          message: 'Failed to save tempSecret to user table',
        })
        return
      }

      const service = appConfig.twoFactorAuth.serviceName
      const otpauth = authenticator.keyuri(
        currentSession?.data?.email,
        service,
        tempSecret
      )

      qrcode.toDataURL(otpauth, (err, imageUrl) => {
        if (err) {
          console.warn('Error with QR')
          return
        }

        res.send({ status: 'success', qrcode: imageUrl })
      })
    })

    // verify token and save temp secret to user
    app.post('/api/2fa/setup', async (req, res) => {
      const token = req.body?.token
      if (!token) {
        res.status(422).send({ status: 'error', message: 'no token' })
        return
      }

      const context = await commonContext.withRequest(req, res)
      const currentSession = context?.session
      if (!currentSession) {
        res
          .status(403)
          .send({ status: 'fail', data: { session: 'no session' } })
        return
      }

      if (
        context.session?.data.twoFactorAuth.set &&
        (!req.cookies[cookieName2fa] ||
          !verify2FAJWT(req.cookies[cookieName2fa], context.session.itemId))
      ) {
        res
          .status(403)
          .send({ status: 'fail', data: { session: 'invalid 2fa' } })
        return
      }

      const user = await context.db.User.findOne({
        where: { id: currentSession?.itemId },
      })
      if (!user) {
        res.status(500).send({ status: 'error', message: 'no user' })
        return
      }

      const tempSecret = user?.twoFactorAuthTemp
      const isValid = authenticator.check(token, String(tempSecret))

      if (isValid) {
        try {
          await context.prisma.User.update({
            where: { id: currentSession?.itemId },
            data: {
              twoFactorAuthSecret: tempSecret,
              twoFactorAuthTemp: '',
            },
          })
          const jwtToken = issue2FAJWT(currentSession?.itemId)
          res.cookie(
            appConfig.twoFactorAuth.cookieName,
            jwtToken,
            twoFactorAuthCookieOptions()
          )
        } catch (error) {
          const annotatedErr = errors.helpers.wrap(
            error,
            'post2faSetup',
            'Failed to save 2fa setup to user table'
          )
          emitStructured({
            severity: 'ERROR',
            message: errors.helpers.printAll(
              annotatedErr,
              { withStack: true, withPayload: true },
              0,
              0
            ),
          })
          res.status(500).send({
            status: 'error',
            message: 'Failed to save 2fa setup to user table',
          })
          return
        }
        res.send({ status: 'success' })
      } else {
        res
          .status(403)
          .send({ status: 'fail', data: { token: 'invalid token' } })
        return
      }
    })

    // clear exist secret
    app.post('/api/2fa/clear', async (req, res) => {
      const token = req.body?.token
      if (!token) {
        res.status(401).send({ status: 'error', message: 'no token' })
        return
      }

      const context = await commonContext.withRequest(req, res)
      const currentSession = context?.session
      if (!currentSession) {
        res
          .status(401)
          .send({ status: 'fail', data: { session: 'no session' } })
        return
      }

      if (
        context.session?.data.twoFactorAuth.set &&
        (!req.cookies[cookieName2fa] ||
          !verify2FAJWT(req.cookies[cookieName2fa], context.session.itemId))
      ) {
        res
          .status(401)
          .send({ status: 'fail', data: { session: 'invalid 2fa' } })
        return
      }

      const user = await context.db.User.findOne({
        where: { id: currentSession?.itemId },
      })
      if (!user) {
        res.status(500).send({ status: 'error', message: 'no user' })
        return
      }

      const isValid = authenticator.check(
        token,
        String(user?.twoFactorAuthSecret)
      )

      if (isValid) {
        try {
          await context.prisma.User.update({
            where: { id: currentSession?.itemId },
            data: {
              twoFactorAuthSecret: '',
            },
          })
        } catch (error) {
          const annotatedErr = errors.helpers.wrap(
            error,
            'post2faClear',
            'Failed to clear 2fa token in user table'
          )
          emitStructured({
            severity: 'ERROR',
            message: errors.helpers.printAll(
              annotatedErr,
              { withStack: true, withPayload: true },
              0,
              0
            ),
          })
          res.status(500).send({
            status: 'error',
            message: 'Failed to clear 2fa token in user table',
          })
          return
        }
        res.send({ status: 'success' })
      } else {
        res
          .status(401)
          .send({ status: 'fail', data: { token: 'invalid token' } })
        return
      }
    })

    // verify token
    app.post('/api/2fa/check', async (req, res) => {
      const token = req.body?.token
      if (!token) {
        res.status(422).send({ status: 'error', message: 'no token' })
        return
      }

      const context = await commonContext.withRequest(req, res)
      const currentSession = context?.session
      if (!currentSession) {
        res
          .status(403)
          .send({ status: 'fail', data: { session: 'no session' } })
        return
      }

      const user = await context.db.User.findOne({
        where: { id: currentSession?.itemId },
      })
      if (!user) {
        res.status(500).send({ status: 'error', message: 'no user' })
        return
      }

      const isValid = authenticator.check(
        token,
        String(user?.twoFactorAuthSecret)
      )

      if (isValid) {
        const jwtToken = issue2FAJWT(currentSession?.itemId)

        res.cookie(
          appConfig.twoFactorAuth.cookieName,
          jwtToken,
          twoFactorAuthCookieOptions()
        )
        res.send({ status: 'success' })
      } else {
        res.send({ status: 'error' })
      }
    })

    // get user bypass info for 2fa-verify step.
    app.get('/api/2fa/isBypassed', async (req, res) => {
      const context = await commonContext.withRequest(req, res)
      const currentSession = context?.session
      if (!currentSession) {
        res
          .status(403)
          .send({ status: 'fail', data: { session: 'no session' } })
        return
      }
      res.status(200).send({
        status: 'success',
        data: { twoFactorAuth: currentSession?.data?.twoFactorAuth },
      })
      return
    })
  }
}
