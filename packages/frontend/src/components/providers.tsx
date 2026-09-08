'use client'

import { HeaderProvider } from '@kids-reporter/routing-ui'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useMemo } from 'react'

import { getQueryClient } from '@/api-utils/react-query/get-query-client'
import { usePopularKeywords } from '@/api-utils/react-query/hooks/popular-keywords'
import { AuthProvider } from '@/services/auth/auth-provider'

import StyledComponentsRegistry from './registry'

function HeaderProviderWithPopularKeywords({
  children,
  traceHeaders,
}: {
  children: React.ReactNode
  traceHeaders?: Record<string, string>
}) {
  const { data: keywords } = usePopularKeywords(traceHeaders)
  const keywordsArray = useMemo(
    () =>
      keywords
        ?.map((keyword) => keyword?.name ?? '')
        .filter((name): name is string => Boolean(name)) ?? [],
    [keywords]
  )
  return <HeaderProvider keywords={keywordsArray}>{children}</HeaderProvider>
}

function Providers({
  children,
  traceHeaders,
}: {
  children: React.ReactNode
  traceHeaders: Record<string, string>
}) {
  const queryClient = getQueryClient()

  return (
    <StyledComponentsRegistry>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <HeaderProviderWithPopularKeywords traceHeaders={traceHeaders}>
            {children}
          </HeaderProviderWithPopularKeywords>
        </AuthProvider>
        <ReactQueryDevtools
          initialIsOpen={false}
          position="left"
          buttonPosition="bottom-left"
        />
      </QueryClientProvider>
    </StyledComponentsRegistry>
  )
}

export default Providers
