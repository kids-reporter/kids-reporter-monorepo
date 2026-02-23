// @ts-ignore `@twreporter/errors` does not have typescript definition file yet
import _errors from '@twreporter/errors'
import axios from 'axios'

const errors = _errors.default

export const formatAxiosError = (err: unknown): Error => {
  if (!axios.isAxiosError(err)) {
    return errors.helpers.wrap(
      err,
      err instanceof Error ? err.name : 'UnknownError',
      err instanceof Error ? err.message : String(err)
    )
  }

  let message = 'failed to make an axios request'
  if (err.response) {
    message = `an axios request was made but response with status ${err.response?.status}`
  } else if (err.request) {
    message = 'an axios request was made but no response was received'
  }

  const axiosError = {
    name: 'AxiosError',
    message,
    code: err.code,
    status: err.response?.status,
    method: err.config?.method,
    url: err.config?.url,
    responseData: err.response?.data,
  }

  return errors.helpers.wrap(undefined, axiosError.name, axiosError.message, {
    axiosError,
  })
}
