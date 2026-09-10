'use client'

import { sendGTMEvent } from '@next/third-parties/google'
import { useEffect } from 'react'

import { useHydratedAuthStore } from '@/services/auth/use-hydrated-auth-store'

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { hydrated, tokens, status, member, exchangeTokenAndPopulateMember } =
    useHydratedAuthStore()

  const expiresAtMs = tokens?.expiresAt

  useEffect(() => {
    if (!hydrated) {
      // wait for sessionStorage hydration
      return
    }

    if (status === 'loading' || status === 'logged_out') {
      return
    }

    if (
      status === 'idle' ||
      (expiresAtMs && expiresAtMs <= Math.round(Date.now() / 1000))
    ) {
      exchangeTokenAndPopulateMember()
    }
  }, [exchangeTokenAndPopulateMember, expiresAtMs, status, hydrated])

  useEffect(() => {
    if (
      status === 'authenticated' &&
      member?.twreporter_user_id &&
      member?.id
    ) {
      sendGTMEvent({
        event: 'kids_member_loaded',
        user_id: member.twreporter_user_id,
        kids_member_id: member.id,
      })
    }
  }, [status, member?.twreporter_user_id, member?.id])

  return <>{children}</>
}

export { AuthProvider }
