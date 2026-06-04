import envVars from '@/environment-variables'

import { devRobotsTxt, prodRobotsTxt } from '../robots-txt-content'

export function GET() {
  const body = envVars.isProduction ? prodRobotsTxt : devRobotsTxt

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
