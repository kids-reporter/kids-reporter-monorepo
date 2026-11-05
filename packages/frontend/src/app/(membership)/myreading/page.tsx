import { Metadata } from 'next'

import { ContentType, KIDS_URL_ORIGIN } from '@/constants'
import MyReadingModule from '@/modules/membership/my-reading'

export const metadata: Metadata = {
  title: '我的閱讀 - 少年報導者 The Reporter for Kids',
  alternates: {
    canonical: `${KIDS_URL_ORIGIN}/myreading`,
  },
  openGraph: {
    title: '我的閱讀 - 少年報導者 The Reporter for Kids',
    description:
      '《少年報導者》是由非營利媒體《報導者》針對兒少打造的深度新聞報導品牌，與兒童和少年一起理解世界，參與未來。在我的閱讀頁，你可以檢視你的收藏、回答和造訪紀錄。',
    url: `${KIDS_URL_ORIGIN}/myreading`,
    type: ContentType.ARTICLE,
  },
}

export default function MyReadingPage() {
  return <MyReadingModule />
}
