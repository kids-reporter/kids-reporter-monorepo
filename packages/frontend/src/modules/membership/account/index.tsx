'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { emitStructured } from '@kids-reporter/logger'
import {
  Button,
  HeaderMobileBackButtonHrefSetter,
} from '@kids-reporter/routing-ui'
import errors from '@twreporter/errors'
import { useCallback, useMemo, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { useUpdateMemberProfileMutation } from '@/api-utils/react-query/hooks/member'
import {
  useDeleteMemberAvatarMutation,
  useUploadMemberAvatarMutation,
} from '@/api-utils/react-query/hooks/member-avatars'
import { DEFAULT_TEXT_HOLDER } from '@/constants/input-field'
import envVars from '@/environment-variables'
import { useHydratedAuthStore } from '@/services/auth/use-hydrated-auth-store'
import { getFormattedDate } from '@/utils'

import MembershipSideMenu from '../components/side-menu'
import UserAvatar from '../components/user-avatar'
import { AccountFormData, accountFormSchema } from '../types'
import EditMode from './edit-mode'
import EditUserAvatar from './edit-user-avatar'
import ViewMode from './view-mode'
function Account() {
  const [isEditMode, setIsEditMode] = useState(false)
  const avatarFileRef = useRef<File | null>(null)

  const {
    member,
    tokens,
    hydrated: isFetchedMember,
    fetchMember,
  } = useHydratedAuthStore()

  const defaultValues = useMemo(() => {
    return {
      name: member?.name ?? '',
      nickname: member?.nickname ?? '',
      contactEmail: member?.contactEmail ?? '',
      ...(member?.avatar?.url ? { avatarUrl: member.avatar.url } : {}),
    }
  }, [member])

  const methods = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    values: defaultValues,
    mode: 'onBlur',
  })

  const { mutateAsync: updateMemberProfile } = useUpdateMemberProfileMutation({
    accessToken: tokens?.accessToken ?? '',
    memberId: member?.id ?? '',
  })

  const { mutateAsync: uploadMemberAvatar } = useUploadMemberAvatarMutation({
    accessToken: tokens?.accessToken ?? '',
  })

  const { mutateAsync: deleteMemberAvatar } = useDeleteMemberAvatarMutation({
    accessToken: tokens?.accessToken ?? '',
  })

  const {
    handleSubmit,
    reset,
    getFieldState,
    formState: { isDirty },
  } = methods

  const handleEdit = () => {
    setIsEditMode(true)
  }

  const handleUpdateMemberProfile = useCallback(
    async (data: AccountFormData) => {
      try {
        const avatarUrlFieldState = getFieldState('avatarUrl')
        const isAvatarDirty = avatarUrlFieldState?.isDirty
        if (isAvatarDirty && avatarFileRef.current) {
          // upload new avatar first
          await uploadMemberAvatar({
            file: avatarFileRef.current,
            fileName: data.name ?? '',
          })
          // we don't have to delete old avatar in content-api since it's handled by the content-api server
          if (!envVars.useContentApi) {
            // delete old avatar
            const oldAvatarId = member?.avatar?.id
            if (oldAvatarId) {
              await deleteMemberAvatar(oldAvatarId)
            }
          }

          avatarFileRef.current = null
        }

        await updateMemberProfile({
          data: {
            name: data.name ?? '',
            nickname: data.nickname ?? '',
            contactEmail: data.contactEmail ?? '',
          },
        })
        toast.success('已儲存')
        setIsEditMode(false)
        fetchMember()
      } catch (_error) {
        const err = errors.helpers.wrap(
          _error,
          'AccountError',
          'Error to update member profile'
        )

        const msg = errors.helpers.printAll(err, {
          withStack: true,
          withPayload: true,
        })

        emitStructured({ severity: 'ERROR', message: msg })
        toast.error('儲存失敗，請稍後再試。')
      }
    },
    [
      getFieldState,
      updateMemberProfile,
      member?.avatar?.id,
      uploadMemberAvatar,
      deleteMemberAvatar,
      fetchMember,
    ]
  )

  const handleFormSubmit = useCallback(() => {
    handleSubmit(handleUpdateMemberProfile)()
  }, [handleSubmit, handleUpdateMemberProfile])

  const handleCancel = () => {
    setIsEditMode(false)
    reset(defaultValues)
    avatarFileRef.current = null
  }

  const memberData = useMemo(() => {
    return {
      name: isFetchedMember ? (member?.name ?? '') : DEFAULT_TEXT_HOLDER,
      nickname: isFetchedMember
        ? (member?.nickname ?? '')
        : DEFAULT_TEXT_HOLDER,
      id: isFetchedMember ? (member?.id ?? '') : DEFAULT_TEXT_HOLDER,
      contactEmail: isFetchedMember
        ? (member?.contactEmail ?? '')
        : DEFAULT_TEXT_HOLDER,
      joinedDate: isFetchedMember
        ? getFormattedDate(member?.joinedAt ?? '', '/')
        : DEFAULT_TEXT_HOLDER,
    }
  }, [isFetchedMember, member])

  return (
    <FormProvider {...methods}>
      <div className="mx-auto w-full bg-neutral-100 pt-6 pb-40 tablet:pt-8 desktop:px-12 desktop:pt-16 desktop:pb-50">
        <div className="mx-auto w-full max-w-300 tablet:grid tablet:grid-cols-12">
          <HeaderMobileBackButtonHrefSetter href="/member" />
          <div className="hidden tablet:col-span-2 tablet:block tablet:min-w-[150px] desktop:pr-8">
            <MembershipSideMenu />
          </div>
          <div className="flex w-full gap-9 tablet:col-span-10 hd:gap-13">
            <div className="flex flex-1 flex-col px-6 tablet:px-8 desktop:px-0">
              <div className="mb-6 flex items-center justify-between desktop:mb-8">
                <h1 className="prose-h4-small font-family-swei text-neutral-900 desktop:prose-h4-large">
                  個人資料
                </h1>
                {isEditMode ? (
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size={36}
                      onClick={handleCancel}
                    >
                      取消
                    </Button>
                    <Button
                      variant="primary"
                      size={36}
                      onClick={handleFormSubmit}
                      disabled={!isDirty}
                    >
                      儲存
                    </Button>
                  </div>
                ) : (
                  <Button variant="primary" size={36} onClick={handleEdit}>
                    編輯
                  </Button>
                )}
              </div>

              <div className="mb-5 flex w-full items-center justify-center tablet:hidden">
                {isEditMode ? (
                  <EditUserAvatar
                    name={member?.name ?? ''}
                    onFileSelect={(file) => {
                      avatarFileRef.current = file
                    }}
                  />
                ) : (
                  <UserAvatar
                    avatar={member?.avatar?.url ?? ''}
                    name={member?.name ?? ''}
                  />
                )}
              </div>

              {isEditMode ? (
                <EditMode
                  id={member?.id ?? ''}
                  joinedAt={member?.joinedAt ?? ''}
                />
              ) : (
                <ViewMode {...memberData} />
              )}
            </div>
            <div className="mt-[70px] hidden tablet:mr-8 tablet:block desktop:mt-[78px] desktop:mr-0">
              {isEditMode ? (
                <EditUserAvatar
                  name={member?.name ?? ''}
                  onFileSelect={(file) => {
                    avatarFileRef.current = file
                  }}
                />
              ) : (
                <UserAvatar
                  avatar={member?.avatar?.url ?? ''}
                  name={member?.name ?? ''}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  )
}

export default Account
