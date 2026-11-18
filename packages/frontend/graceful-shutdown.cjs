const http = require('http')

const originalListen = http.Server.prototype.listen
let captured = false

/** @param {...any} args */
http.Server.prototype.listen = function listenAndCapture(...args) {
  if (!captured) {
    captured = true
    globalThis.__KIDS_FRONTEND_HTTP_SERVER = this
  }
  return Reflect.apply(originalListen, this, args)
}
