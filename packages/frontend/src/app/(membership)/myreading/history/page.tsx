import { Metadata } from 'next'

import { ContentType, KIDS_URL_ORIGIN } from '@/constants'
import MyReadingHistory from '@/modules/membership/my-reading/history'

const title = '造訪紀錄 - 少年報導者 The Reporter for Kids'
const description =
  '《少年報導者》是由非營利媒體《報導者》針對兒少打造的深度新聞報導品牌，與兒童和少年一起理解世界，參與未來。在造訪紀錄頁，你可以檢視你造訪過的文章或專題頁並使用收藏功能。'
const url = `${KIDS_URL_ORIGIN}/myreading/history`

export const metadata: Metadata = {
  title,
  alternates: {
    canonical: url,
  },
  openGraph: {
    title,
    description,
    url,
    type: ContentType.ARTICLE,
  },
}

export default function MyReadingHistoryPage() {
  return <MyReadingHistory />
}
