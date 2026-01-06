import { Metadata } from 'next'

import { ContentType, KIDS_URL_ORIGIN } from '@/constants'
import IdeaHubModule from '@/modules/idea-hub'

export const metadata: Metadata = {
  title: '小讀者觀點大集合',
  alternates: {
    canonical: `${KIDS_URL_ORIGIN}/idea-hub`,
  },
  openGraph: {
    title: '小讀者觀點大集合',
    description:
      '《少年報導者》是由非營利媒體《報導者》針對兒少打造的深度新聞報導品牌，與兒童和少年一起理解世界，參與未來。在小讀者觀點大集合頁，你可以瀏覽其他使用者的思辨題回答並探索更多新聞！',
    url: `${KIDS_URL_ORIGIN}/idea-hub`,
    type: ContentType.ARTICLE,
  },
}

function IdeaHubPage() {
  return <IdeaHubModule />
}

export default IdeaHubPage
