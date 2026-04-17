'use client'

import { useCallback, useState } from 'react'

import { IdeaHubIcon, IdeaHubIconLarge } from '@/icons/miscellaneous'

import AllAnswers from './all-answers'
import LatestAnswers from './latest-answers'
import PostEssayQuestionsModal from './post-essay-questions-modal'

function IdeaHub() {
  const [selectedPostSlug, setSelectedPostSlug] = useState<string | null>(null)

  const handleOpenModal = useCallback((postSlug: string) => {
    setSelectedPostSlug(postSlug)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedPostSlug(null)
  }, [])

  return (
    <>
      <div className="mx-auto flex w-full max-w-300 flex-col items-center px-6 pt-10 tablet:px-8 tablet:pt-12 desktop:px-12 desktop:pt-18 hd:px-14 hd:pt-24">
        <div className="mb-4 flex items-center gap-2 desktop:mb-6">
          <div className="flex size-11 items-center justify-center desktop:size-16">
            <IdeaHubIcon className="desktop:hidden" />
            <IdeaHubIconLarge className="hidden desktop:block" />
          </div>
          <h2 className="prose-h2-small font-swei text-neutral-900 desktop:prose-h2-large hd:prose-h1-large">
            小讀者思辨牆
          </h2>
        </div>
        <span className="text-center prose-h6-small desktop:prose-h6-large">
          看看大家的對話，一起想，一起長大！
        </span>
        <LatestAnswers onOpenModal={handleOpenModal} />
        <AllAnswers onOpenModal={handleOpenModal} />
      </div>

      <PostEssayQuestionsModal
        postSlug={selectedPostSlug ?? ''}
        open={!!selectedPostSlug}
        onClose={handleCloseModal}
      />
    </>
  )
}

export default IdeaHub
