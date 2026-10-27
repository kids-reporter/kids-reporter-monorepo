import { Metadata } from 'next'

import { ContentType, KIDS_URL_ORIGIN } from '@/constants'
import MyReadingSaved from '@/modules/membership/my-reading/saved'

export const metadata: Metadata = {
  title: '我的收藏 - 少年報導者 The Reporter for Kids',
  alternates: {
    canonical: `${KIDS_URL_ORIGIN}/myreading/saved`,
  },
  openGraph: {
    title: '我的收藏 - 少年報導者 The Reporter for Kids',
    description:
      '《少年報導者》是由非營利媒體《報導者》針對兒少打造的深度新聞報導品牌，與兒童和少年一起理解世界，參與未來。在我的收藏頁，你可以檢視或取消你收藏的文章或專題頁。',
    url: `${KIDS_URL_ORIGIN}/myreading/saved`,
    type: ContentType.ARTICLE,
  },
}

export default function MyReadingSavedPage() {
  return <MyReadingSaved />
}
