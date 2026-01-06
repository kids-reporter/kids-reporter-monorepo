import envVars from '@/environment-variables'
import Login from '@/modules/login'

const defaultDestination = 'https://kids.twreporter.org'
const allowedDestinationOrigins = new Set([
  'https://kids.twreporter.org',
  'https://dev-kids.twreporter.org',
  'https://ndx-kids.twreporter.org',
  'https://staging-kids.twreporter.org',
  ...(envVars.nodeEnv === 'development'
    ? ['http://localhost:3000', 'http://localhost:3001']
    : []),
])

function sanitizeDestination(rawDestination?: string): {
  destination: string
  isSubpath: boolean
} {
  if (!rawDestination) {
    return { destination: defaultDestination, isSubpath: false }
  }

  try {
    const parsed = new URL(rawDestination)
    if (allowedDestinationOrigins.has(parsed.origin)) {
      return {
        destination: parsed.toString(),
        isSubpath: parsed.pathname !== '/',
      }
    }
  } catch {
    // fall through to default destination
  }

  return { destination: defaultDestination, isSubpath: false }
}

async function LoginPage({
  searchParams,
}: {
  searchParams: {
    destination?: string
  }
}) {
  const { destination, isSubpath } = sanitizeDestination(
    searchParams.destination
  )
  const iframeSrc = `${envVars.loginWidgetUrl}?destination=${encodeURIComponent(destination)}`

  return <Login iframeSrc={iframeSrc} showToastToLogin={isSubpath} />
}

export default LoginPage
