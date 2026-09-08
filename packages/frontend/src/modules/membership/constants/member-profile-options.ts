export const MEMBER_IDENTITY_OPTIONS = [
  { label: '學生', value: 'student' },
  { label: '家長', value: 'parent' },
  { label: '老師', value: 'teacher' },
  { label: '社會人士', value: 'public' },
] as const

export const MEMBER_LOCATION_COUNTRY_OPTIONS = [
  { label: '台灣', value: 'taiwan' },
  { label: '其他', value: 'other' },
] as const

export const TAIWAN_CITY_OPTIONS = [
  { label: '基隆市', value: '基隆市' },
  { label: '台北市', value: '台北市' },
  { label: '新北市', value: '新北市' },
  { label: '桃園市', value: '桃園市' },
  { label: '新竹市', value: '新竹市' },
  { label: '新竹縣', value: '新竹縣' },
  { label: '苗栗縣', value: '苗栗縣' },
  { label: '台中市', value: '台中市' },
  { label: '彰化縣', value: '彰化縣' },
  { label: '南投縣', value: '南投縣' },
  { label: '雲林縣', value: '雲林縣' },
  { label: '嘉義市', value: '嘉義市' },
  { label: '嘉義縣', value: '嘉義縣' },
  { label: '台南市', value: '台南市' },
  { label: '高雄市', value: '高雄市' },
  { label: '屏東縣', value: '屏東縣' },
  { label: '宜蘭縣', value: '宜蘭縣' },
  { label: '花蓮縣', value: '花蓮縣' },
  { label: '台東縣', value: '台東縣' },
  { label: '澎湖縣', value: '澎湖縣' },
  { label: '金門縣', value: '金門縣' },
  { label: '連江縣', value: '連江縣' },
] as const

export const CONTINENT_OPTIONS = [
  { label: '亞洲', value: '亞洲' },
  { label: '歐洲', value: '歐洲' },
  { label: '非洲', value: '非洲' },
  { label: '北美洲', value: '北美洲' },
  { label: '南美洲', value: '南美洲' },
  { label: '大洋洲', value: '大洋洲' },
  { label: '南極洲', value: '南極洲' },
] as const

export type MemberIdentity = (typeof MEMBER_IDENTITY_OPTIONS)[number]['value']
export type MemberLocationCountry =
  (typeof MEMBER_LOCATION_COUNTRY_OPTIONS)[number]['value']

export const getIdentityLabel = (value?: string | null) =>
  MEMBER_IDENTITY_OPTIONS.find((option) => option.value === value)?.label

export const getLocationCountryLabel = (value?: string | null) =>
  MEMBER_LOCATION_COUNTRY_OPTIONS.find((option) => option.value === value)
    ?.label

export const formatBirthdayForDisplay = (value?: string | null) => {
  if (!value) return ''
  return value.replaceAll('-', '/')
}

export const formatBirthdayForApi = (value?: string) => {
  if (!value) return null
  return value.replaceAll('/', '-')
}
