import { Header } from '@kids-reporter/routing-ui'

import AuthHeaderLoggedInSetter from '@/components/auth-header-logged-in-setter'
import ScrollUpBaodaozaiEventTrigger from '@/components/scroll-up-baodaozai-event-trigger'
import { Baodaozai, CallBaodaozaiProvider } from '@/services/call-baodaozai'
import { FeatureIntroDialogProvider } from '@/services/feature-intro'
import FeatureIntroDialog from '@/services/feature-intro/components/feature-info-dialog'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CallBaodaozaiProvider>
        <FeatureIntroDialogProvider>
          <Header />
          <AuthHeaderLoggedInSetter />
          <div className="flex w-full grow">{children}</div>
          <Baodaozai />
          <ScrollUpBaodaozaiEventTrigger />
          <FeatureIntroDialog />
        </FeatureIntroDialogProvider>
      </CallBaodaozaiProvider>
    </>
  )
}
