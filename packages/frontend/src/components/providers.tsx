'use client'

import { HeaderProvider } from '@kids-reporter/routing-ui'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { getQueryClient } from '@/api-utils/react-query/get-query-client'
import { AuthProvider } from '@/services/auth/auth-provider'
import { FeatureIntroDialogProvider } from '@/services/feature-intro'

import StyledComponentsRegistry from './registry'

function Providers({
  children,
  keywords,
}: {
  children: React.ReactNode
  keywords: string[]
}) {
  const queryClient = getQueryClient()

  return (
    <StyledComponentsRegistry>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <HeaderProvider keywords={keywords}>
            <FeatureIntroDialogProvider>{children}</FeatureIntroDialogProvider>
          </HeaderProvider>
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
