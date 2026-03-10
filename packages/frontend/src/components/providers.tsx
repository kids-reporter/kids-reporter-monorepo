'use client'

import { HeaderProvider } from '@kids-reporter/routing-ui'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useMemo } from 'react'

import { getQueryClient } from '@/api-utils/react-query/get-query-client'
import { usePopularKeywords } from '@/api-utils/react-query/hooks/popular-keywords'
import { AuthProvider } from '@/services/auth/auth-provider'
import { FeatureIntroDialogProvider } from '@/services/feature-intro'

import StyledComponentsRegistry from './registry'

function HeaderProviderWithPopularKeywords({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: keywords } = usePopularKeywords()
  const keywordsArray = useMemo(
    () => keywords?.map((keyword) => keyword?.name ?? '') ?? [],
    [keywords]
  )
  return <HeaderProvider keywords={keywordsArray}>{children}</HeaderProvider>
}

function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <StyledComponentsRegistry>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <HeaderProviderWithPopularKeywords>
            <FeatureIntroDialogProvider>{children}</FeatureIntroDialogProvider>
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
