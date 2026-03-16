'use client'

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
  ACCESS_TOKEN_ENDPOINT,
  LOGOUT_ENDPOINT,
  STATUS_CODES,
} from '@/constants'
import envVars from '@/environment-variables'
import { log, LogLevel } from '@/utils'

export type MemberProfile = {
  id: string
  name?: string
  email?: string
  twreporter_user_id?: string
  showBaodaozai?: boolean
  essayQuestionCount?: number
  nickname?: string
  contactEmail?: string
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

type AccessTokenResponse = {
  status: 'success' | 'fail' | 'error'
  data: {
    accessToken: string
    expiresAt?: number
    twreporterUserId: string
  }
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

            try {
              axiosRes = await axios.post<AccessTokenResponse>(
                ACCESS_TOKEN_ENDPOINT,
                null,
                { timeout: envVars.requestTimeoutMs, withCredentials: true }
              )
            } catch (err) {
              if (axios.isAxiosError(err)) {
                const statusCode = err.response?.status
                if (
                  statusCode === STATUS_CODES.BAD_REQUEST ||
                  statusCode === STATUS_CODES.UNAUTHORIZED
                ) {
                  // Fail to get access token due to invalid id_token.
                  set({
                    status: 'unauthenticated',
                    member: undefined,
                    tokens: undefined,
                    error: undefined,
                  })
                  return
                }

                throw errors.helpers.annotateAxiosError(err)
              }

              throw err
            }

            const payload = axiosRes.data?.data

            if (!payload?.accessToken) {
              throw new Error('Fail to exchange access token')
            }

            const expiresAt =
              typeof payload.expiresAt === 'number'
                ? payload.expiresAt
                : Math.round(Date.now() / 1000) + 3600

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
                avatar: {
                  id: member.avatar?.id ?? '',
                  url: member.avatar?.fileUrl ?? '',
                },
                joinedAt: member.createdAt,
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

            log(LogLevel.ERROR, msg)

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
                  avatar: {
                    id: latest.avatar?.id ?? '',
                    url: latest.avatar?.fileUrl ?? '',
                  },
                  joinedAt: latest.createdAt,
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
            log(
              LogLevel.ERROR,
              '[auth-store] fetchMember failed: ' + err.message
            )
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

            log(LogLevel.ERROR, msg)

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
