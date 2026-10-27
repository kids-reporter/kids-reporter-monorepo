import { Metadata } from 'next'

import { ContentType, KIDS_URL_ORIGIN } from '@/constants'
import MyReadingResponse from '@/modules/membership/my-reading/response'

export const metadata: Metadata = {
  title: '我的回答 - 少年報導者 The Reporter for Kids',
  alternates: {
    canonical: `${KIDS_URL_ORIGIN}/myreading/response`,
  },
  openGraph: {
    title: '我的回答 - 少年報導者 The Reporter for Kids',
    description:
      '《少年報導者》是由非營利媒體《報導者》針對兒少打造的深度新聞報導品牌，與兒童和少年一起理解世界，參與未來。在我的回答頁，你可以檢視和編輯你的選擇題、思辨題回答。',
    url: `${KIDS_URL_ORIGIN}/myreading/response`,
    type: ContentType.ARTICLE,
  },
}

export default function MyReadingResponsePage() {
  return <MyReadingResponse />
}
