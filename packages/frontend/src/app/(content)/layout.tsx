import { Header } from '@kids-reporter/routing-ui'

import AuthHeaderLoggedInSetter from '@/components/auth-header-logged-in-setter'
import { Baodaozai, CallBaodaozaiProvider } from '@/services/call-baodaozai'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CallBaodaozaiProvider>
        <Header />
        <AuthHeaderLoggedInSetter />
        <div className="flex w-full grow">{children}</div>
        <Baodaozai />
      </CallBaodaozaiProvider>
    </>
  )
}
