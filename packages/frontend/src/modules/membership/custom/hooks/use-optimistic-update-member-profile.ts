import { emitStructured } from '@kids-reporter/logger'
import errors from '@twreporter/errors'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useUpdateMemberProfileMutation } from '@/api-utils/react-query/hooks/member'
import { BAODAOZAI_DEFAULT_ESSAY_QUESTION_COUNT } from '@/constants/baodaozai-question-count'
import useDebounceValue from '@/hooks/use-debounce-value'
import { useHydratedAuthStore } from '@/services/auth/use-hydrated-auth-store'
import type { MemberProfilePatch } from '@/types/api'

function useOptimisticUpdateMemberReadingSettings() {
  const {
    member,
    tokens,
    hydrated: isFetchedMember,
    fetchMember,
  } = useHydratedAuthStore()

  // Local state for UI management
  const [localShowBaodaozai, setLocalShowBaodaozai] = useState<
    boolean | undefined
  >(undefined)
  const [localEssayQuestionCount, setLocalEssayQuestionCount] = useState<
    number | undefined
  >(undefined)

  // Store original values for rollback on error
  const originalValuesRef = useRef<{
    showBaodaozai: boolean | undefined
    essayQuestionCount: number | undefined
  } | null>(null)

  // Debounce local state values
  const debouncedShowBaodaozai = useDebounceValue<boolean | undefined>(
    localShowBaodaozai,
    1000
  )

  const debouncedEssayQuestionCount = useDebounceValue<number | undefined>(
    localEssayQuestionCount,
    1000
  )

  const { mutateAsync: updateMemberProfile, ...rest } =
    useUpdateMemberProfileMutation({
      accessToken: tokens?.accessToken ?? '',
      memberId: member?.id ?? '',
    })

  // Initialize and sync local state from member data
  useEffect(() => {
    if (!isFetchedMember) {
      return
    }

    const memberShowBaodaozai = member?.showBaodaozai
    const memberEssayQuestionCount =
      member?.essayQuestionCount ?? BAODAOZAI_DEFAULT_ESSAY_QUESTION_COUNT

    if (localShowBaodaozai === undefined && memberShowBaodaozai !== undefined) {
      setLocalShowBaodaozai(memberShowBaodaozai)
      setLocalEssayQuestionCount(memberEssayQuestionCount)
      originalValuesRef.current = {
        showBaodaozai: memberShowBaodaozai,
        essayQuestionCount: memberEssayQuestionCount,
      }
    }
  }, [
    isFetchedMember,
    localShowBaodaozai,
    member?.essayQuestionCount,
    member?.showBaodaozai,
  ])

  // Handle debounced API calls
  useEffect(() => {
    if (
      !isFetchedMember ||
      originalValuesRef.current === null ||
      debouncedShowBaodaozai === undefined ||
      debouncedEssayQuestionCount === undefined
    ) {
      return
    }

    // Check if debounced values differ from original values
    const originalValues = originalValuesRef.current
    const hasShowBaodaozaiChanged =
      debouncedShowBaodaozai !== originalValues.showBaodaozai
    const hasEssayQuestionCountChanged =
      debouncedEssayQuestionCount !== originalValues.essayQuestionCount

    if (!hasShowBaodaozaiChanged && !hasEssayQuestionCountChanged) {
      return
    }

    // Store previous original values for rollback on error

    const updateData: MemberProfilePatch = {
      ...(hasShowBaodaozaiChanged
        ? { showBaodaozai: debouncedShowBaodaozai }
        : {}),
      ...(hasEssayQuestionCountChanged
        ? { essayQuestionCount: debouncedEssayQuestionCount }
        : {}),
    }

    const previousOriginalValues = { ...originalValuesRef.current }

    const updateAndFetchMemberProfile = async () => {
      try {
        const currentValues = {
          showBaodaozai: debouncedShowBaodaozai,
          essayQuestionCount: debouncedEssayQuestionCount,
        }
        originalValuesRef.current = currentValues
        await updateMemberProfile({ data: updateData })
        await fetchMember()
      } catch (_error) {
        originalValuesRef.current = previousOriginalValues
        setLocalShowBaodaozai(previousOriginalValues.showBaodaozai)
        setLocalEssayQuestionCount(previousOriginalValues.essayQuestionCount)

        const err = errors.helpers.wrap(
          _error,
          'HandleUpdateMemberReadingSettingsError',
          'Error to handle update member reading settings'
        )

        const msg = errors.helpers.printAll(err, {
          withStack: true,
          withPayload: true,
        })
        emitStructured({ severity: 'ERROR', message: msg })
      }
    }

    updateAndFetchMemberProfile()
  }, [
    debouncedShowBaodaozai,
    debouncedEssayQuestionCount,
    isFetchedMember,
    updateMemberProfile,
    fetchMember,
  ])

  const optimisticUpdateMemberReadingSettings = useCallback(
    (data: MemberProfilePatch) => {
      if (data.showBaodaozai !== undefined) {
        setLocalShowBaodaozai(data.showBaodaozai)
      }
      if (data.essayQuestionCount !== undefined) {
        setLocalEssayQuestionCount(data.essayQuestionCount)
      }
    },
    []
  )

  return {
    optimisticUpdateMemberReadingSettings,
    localShowBaodaozai,
    localEssayQuestionCount,
    ...rest,
  }
}

export default useOptimisticUpdateMemberReadingSettings
