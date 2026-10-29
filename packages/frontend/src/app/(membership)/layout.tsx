import { Header } from '@kids-reporter/routing-ui'

import AuthHeaderLoggedInSetter from '@/components/auth-header-logged-in-setter'
import AuthRouteGuard from '@/modules/membership/components/auth-route-guard'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header desktopBackgroundClassName="bg-neutral-100" />
      <AuthHeaderLoggedInSetter />
      <AuthRouteGuard>
        <div className="flex w-full grow">{children}</div>
      </AuthRouteGuard>
    </>
  )
}
