'use client'
import { Input } from '@kids-reporter/routing-ui'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { DatePicker } from '@/components/date-picker'
import Divider from '@/components/divider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/select'
import { getFormattedDate } from '@/utils/get-formatted-date'

import {
  CONTINENT_OPTIONS,
  MEMBER_IDENTITY_OPTIONS,
  MEMBER_LOCATION_COUNTRY_OPTIONS,
  TAIWAN_CITY_OPTIONS,
} from '../constants/member-profile-options'
import { AccountFormData } from '../types'

type EditModeProps = {
  id: string
  joinedAt: string
}

function EditMode({ id, joinedAt }: EditModeProps) {
  const { control, setValue } = useFormContext<AccountFormData>()
  const locationCountry = useWatch({ control, name: 'locationCountry' })

  const regionOptions =
    locationCountry === 'taiwan'
      ? TAIWAN_CITY_OPTIONS
      : locationCountry === 'other'
        ? CONTINENT_OPTIONS
        : []

  const regionPlaceholder =
    locationCountry === 'other' ? '請選擇區域' : '請選擇城市'

  return (
    <div className="flex w-full flex-col gap-5 desktop:gap-6">
      {/* Full Name */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex w-full flex-col gap-1">
            <span className="prose-p1-bold text-neutral-900">全名</span>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  value={field.value || ''}
                  onChange={(value) => field.onChange(value)}
                  onBlur={field.onBlur}
                  placeholder="建議填寫證件姓名"
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  id={field.name}
                />
              )}
            />
          </div>
        </div>
      </div>

      <Divider />

      {/* Nickname */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex w-full flex-col gap-1">
            <span className="prose-p1-bold text-neutral-900">暱稱</span>
            <Controller
              name="nickname"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  value={field.value || ''}
                  onChange={(value) => field.onChange(value)}
                  onBlur={field.onBlur}
                  placeholder="公開顯示於少年報導者思辨牆"
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  id={field.name}
                />
              )}
            />
          </div>
        </div>
      </div>

      <Divider />

      {/* Member Account - Disabled */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex w-full flex-col gap-1">
            <span className="prose-p1-bold text-neutral-900">
              少年報導者會員ID
            </span>
            <span id="member-account-desc" className="sr-only">
              少年報導者會員ID無法編輯
            </span>
            <Input
              value={id}
              placeholder={id}
              disabled
              aria-describedby="member-account-desc"
            />
          </div>
        </div>
      </div>

      <Divider />

      {/* Contact Email */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex w-full flex-col gap-1">
            <span className="prose-p1-bold text-neutral-900">聯絡信箱</span>
            <Controller
              name="contactEmail"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  value={field.value || ''}
                  onChange={(value) => field.onChange(value)}
                  onBlur={field.onBlur}
                  placeholder="請輸入聯絡信箱"
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  id={field.name}
                  className="bg-white [&_input:-webkit-autofill]:shadow-[inset_0_0_0_1000px_white]"
                />
              )}
            />
          </div>
        </div>
      </div>

      <Divider />

      {/* Birthday */}
      <div className="flex flex-col gap-1">
        <div className="flex w-full flex-col gap-1">
          <span className="prose-p1-bold text-neutral-900">生日</span>
          <Controller
            name="birthday"
            control={control}
            render={({ field, fieldState }) => (
              <DatePicker
                id={field.name}
                value={field.value || ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="請選擇出生年月日"
                error={!!fieldState.error}
              />
            )}
          />
        </div>
      </div>

      <Divider />

      {/* Location */}
      <div className="flex flex-col gap-1">
        <span className="prose-p1-bold text-neutral-900">所在地</span>
        <div className="flex flex-col gap-4 tablet:flex-row">
          <Controller
            name="locationCountry"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={(value) => {
                  field.onChange(value)
                  setValue('locationRegion', '', { shouldDirty: true })
                }}
              >
                <SelectTrigger className="w-full min-w-0 flex-1 rounded-xl border border-neutral-400">
                  <SelectValue placeholder="請選擇國家" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {MEMBER_LOCATION_COUNTRY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <Controller
            name="locationRegion"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
                disabled={!locationCountry}
              >
                <SelectTrigger className="w-full min-w-0 flex-1 rounded-xl border border-neutral-400">
                  <SelectValue placeholder={regionPlaceholder} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {regionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <Divider />

      {/* Identity */}
      <div className="flex flex-col gap-1">
        <span className="prose-p1-bold text-neutral-900">身份別</span>
        <Controller
          name="identity"
          control={control}
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-1">
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  className="w-full min-w-0 rounded-xl border border-neutral-400"
                  aria-invalid={!!fieldState.error}
                >
                  <SelectValue placeholder="請選擇身份別" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {MEMBER_IDENTITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.error?.message ? (
                <span className="prose-p2 text-semantic-danger">
                  {fieldState.error.message}
                </span>
              ) : null}
            </div>
          )}
        />
      </div>

      <Divider />

      {/* Join Date - Disabled */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex w-full flex-col gap-1">
            <span className="prose-p1-bold text-neutral-900">加入日期</span>
            <span id="join-date-desc" className="sr-only">
              加入日期無法編輯
            </span>
            <Input
              value={getFormattedDate(joinedAt, '/')}
              placeholder={getFormattedDate(joinedAt, '/')}
              disabled
              aria-describedby="join-date-desc"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditMode
