'use client'

import { sendGTMEvent } from '@next/third-parties/google'

export type MyReadingSection = 'saved' | 'answers' | 'history' | 'hot_topics'

export type SaveLocation = 'article_page' | 'topic_page' | 'my_reading'

export function trackMyReadingArticleClick({
  section,
  articleId,
  articleSlug,
  position,
}: {
  section: MyReadingSection
  articleId: string
  articleSlug: string
  position: number
}) {
  sendGTMEvent({
    event: 'my_reading_article_click',
    section,
    article_id: articleId,
    article_slug: articleSlug,
    position,
  })
}

export function trackArticleSave({
  articleId,
  articleSlug,
  saveLocation,
}: {
  articleId: string
  articleSlug: string
  saveLocation: SaveLocation
}) {
  sendGTMEvent({
    event: 'article_save',
    article_id: articleId,
    article_slug: articleSlug,
    save_location: saveLocation,
  })
}

export function trackArticleUnsave({
  articleId,
  articleSlug,
  saveLocation,
}: {
  articleId: string
  articleSlug: string
  saveLocation: SaveLocation
}) {
  sendGTMEvent({
    event: 'article_unsave',
    article_id: articleId,
    article_slug: articleSlug,
    save_location: saveLocation,
  })
}
