const statusCodes = {
  ok: 200,
  badRequest: 400,
  unauthorized: 401,
  methodNotAllowed: 405,
  internalServerError: 500,
}

const slowThresholdMsRaw = Number(process.env.SLOW_THRESHOLD_MS)
const slowThresholdMs =
  Number.isFinite(slowThresholdMsRaw) && slowThresholdMsRaw > 0
    ? slowThresholdMsRaw
    : 5000

export default {
  statusCodes,
  slowThresholdMs,
}
