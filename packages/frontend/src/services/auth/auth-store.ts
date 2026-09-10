'use client'

import { emitStructured } from '@kids-reporter/logger'
import errors from '@twreporter/errors'
import axios from 'axios'
import { create } from 'zustand'
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from 'zustand/middleware'

import {
  getMemberProfileByMemberId,
  getMemberProfileByTwreporterUserId,
} from '@/api/member'
import {
  CONTENT_ACCESS_TOKEN_ENDPOINT,
  LOGOUT_ENDPOINT,
  STATUS_CODES,
} from '@/constants'
import envVars from '@/environment-variables'
import type { AccessTokenResponse } from '@/types/api'
import { buildTraceHeaders } from '@/utils/trace-context'

export type MemberProfile = {
  id: string
  name?: string
  email?: string
  twreporter_user_id?: string
  showBaodaozai?: boolean
  essayQuestionCount?: number
  nickname?: string
  contactEmail?: string
  birthday?: string | null
  locationCountry?: 'taiwan' | 'other' | null
  locationRegion?: string | null
  identity?: 'student' | 'parent' | 'teacher' | 'public' | null
  avatar?: {
    id: string
    url: string
  }
  joinedAt?: string
}

type AuthTokens = {
  accessToken: string
  expiresAt?: number
}

type AuthStatus =
  | 'idle'
  | 'loading'
  | 'unauthenticated'
  | 'authenticated'
  | 'error'
  | 'logged_out'

type AuthState = {
  member?: MemberProfile
  tokens?: AuthTokens
  status: AuthStatus
  error?: string
  exchangeTokenAndPopulateMember: () => Promise<void>
  fetchMember: () => Promise<void>
  setAuth: (
    payload: Partial<{
      member: MemberProfile
      tokens: AuthTokens
    }>
  ) => void
  clearAuth: ({ nextStatus }: { nextStatus: AuthStatus }) => void
  logout: () => Promise<void>
}

type AccessTokenEnvelopeResponse =
  | AccessTokenResponse
  | {
      status: 'success' | 'fail' | 'error'
      data: AccessTokenResponse
    }

type PersistedAuthState = Partial<
  Pick<AuthState, 'member' | 'tokens' | 'status'>
>

const noopStorage: Storage = {
  length: 0,
  clear() {},
  getItem() {
    return null
  },
  key() {
    return null
  },
  removeItem() {},
  setItem() {},
}

const sessionJSONStorage = createJSONStorage<PersistedAuthState>(() =>
  typeof window === 'undefined' ? noopStorage : window.sessionStorage
)

// AbortController for managing fetchMember race conditions
let fetchMemberAbortController: AbortController | null = null

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        status: 'idle',
        async exchangeTokenAndPopulateMember() {
          set({ status: 'loading', error: undefined })

          try {
            let axiosRes

            const postAccessToken = (url: string) =>
              axios.post<AccessTokenEnvelopeResponse>(url, null, {
                timeout: envVars.requestTimeoutMs,
                withCredentials: true,
                headers: buildTraceHeaders(),
              })

            const handleInvalidIdToken = () => {
              set({
                status: 'unauthenticated',
                member: undefined,
                tokens: undefined,
                error: undefined,
              })
            }

            try {
              axiosRes = await postAccessToken(CONTENT_ACCESS_TOKEN_ENDPOINT)
            } catch (err) {
              if (axios.isAxiosError(err)) {
                const statusCode = err.response?.status
                if (
                  statusCode === STATUS_CODES.BAD_REQUEST ||
                  statusCode === STATUS_CODES.UNAUTHORIZED
                ) {
                  handleInvalidIdToken()
                  return
                }

                throw errors.helpers.annotateAxiosError(err)
              }

              throw err
            }

            const rawUnknown = axiosRes.data as unknown
            const raw =
              rawUnknown && typeof rawUnknown === 'object'
                ? (rawUnknown as AccessTokenEnvelopeResponse)
                : undefined
            const payload =
              raw && 'data' in raw
                ? raw.data
                : (raw as AccessTokenResponse | undefined)

            if (!payload?.accessToken) {
              throw new Error('Fail to exchange access token')
            }

            const expiresAt =
              typeof payload.expiresAt === 'number'
                ? payload.expiresAt
                : Math.round(Date.now() / 1000) + 3600

            if (!payload.twreporterUserId) {
              throw new Error('Fail to exchange access token')
            }

            const member = await getMemberProfileByTwreporterUserId({
              twreporterUserId: payload.twreporterUserId,
              accessToken: payload.accessToken,
            })

            if (!member) {
              throw new Error('Fail to fetch member profile')
            }

            set({
              member: {
                ...member,
                essayQuestionCount: member.essayQuestionCount ?? undefined,
                avatar: {
                  id: member.avatar?.id ?? '',
                  url: member.avatar?.fileUrl ?? '',
                },
                joinedAt: member.createdAt ?? undefined,
              },
              tokens: { accessToken: payload.accessToken, expiresAt },
              status: 'authenticated',
              error: undefined,
            })
          } catch (_err) {
            const err = errors.helpers.wrap(
              _err,
              'AuthStoreError',
              'Error to exchangeTokenAndPopulateMember'
            )

            const msg = errors.helpers.printAll(err, {
              withStack: true,
              withPayload: true,
            })

            emitStructured({ severity: 'ERROR', message: msg })

            set({
              status: 'error',
              error: '登入失敗，請稍後再試。',
            })
          }
        },
        async fetchMember() {
          const { tokens, member } = get()
          if (!tokens?.accessToken || !member?.id) {
            return
          }

          // Abort previous request if exists
          if (fetchMemberAbortController) {
            fetchMemberAbortController.abort()
          }

          // Create new abort controller for this request
          fetchMemberAbortController = new AbortController()
          const currentAbortController = fetchMemberAbortController

          try {
            const latest = await getMemberProfileByMemberId({
              memberId: member.id,
              accessToken: tokens.accessToken,
              abortSignal: currentAbortController.signal,
            })

            // Only update if this request wasn't aborted
            if (!currentAbortController.signal.aborted && latest) {
              set({
                member: {
                  ...latest,
                  essayQuestionCount: latest.essayQuestionCount ?? undefined,
                  avatar: {
                    id: latest.avatar?.id ?? '',
                    url: latest.avatar?.fileUrl ?? '',
                  },
                  joinedAt: latest.createdAt ?? undefined,
                },
                status: 'authenticated',
                error: undefined,
              })
            }
          } catch (_err) {
            // Ignore abort errors
            if (_err instanceof Error && _err.name === 'AbortError') {
              return
            }
            const err = _err instanceof Error ? _err : new Error(String(_err))
            emitStructured({
              severity: 'ERROR',
              message: '[auth-store] fetchMember failed: ' + err.message,
            })
          } finally {
            // Clear abort controller if this was the current one
            if (fetchMemberAbortController === currentAbortController) {
              fetchMemberAbortController = null
            }
          }
        },
        setAuth({ member, tokens }) {
          set({
            ...(member ? { member } : {}),
            ...(tokens ? { tokens } : {}),
            status: 'authenticated',
            error: undefined,
          })
        },
        clearAuth({ nextStatus = 'idle' }: { nextStatus: AuthStatus }) {
          // Abort any pending fetchMember request
          if (fetchMemberAbortController) {
            fetchMemberAbortController.abort()
            fetchMemberAbortController = null
          }
          set({
            member: undefined,
            tokens: undefined,
            status: nextStatus,
            error: undefined,
          })
        },
        async logout() {
          set({ status: 'loading' })
          try {
            await axios.post(LOGOUT_ENDPOINT, null, {
              timeout: envVars.requestTimeoutMs,
              withCredentials: true,
            })
            get().clearAuth({ nextStatus: 'logged_out' })
          } catch (_err) {
            const annotatedErr = errors.helpers.wrap(
              _err,
              'AuthStoreError',
              'Error to logout'
            )

            const msg = errors.helpers.printAll(annotatedErr, {
              withStack: true,
              withPayload: true,
            })

            emitStructured({ severity: 'ERROR', message: msg })

            set({
              status: 'error',
              error: '登出失敗，請稍後再試。',
            })
          }
        },
      }),
      {
        name: 'kids-auth',
        storage: sessionJSONStorage,
        partialize: (state) => {
          if (state.status === 'authenticated') {
            return {
              member: state.member,
              tokens: state.tokens,
              status: state.status,
            }
          }
          return {}
        },
      }
    )
  )
)
