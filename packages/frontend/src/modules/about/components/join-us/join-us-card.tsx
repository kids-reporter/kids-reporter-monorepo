'use client'

import { Button, cn } from '@kids-reporter/routing-ui'
import Image from 'next/image'

import { useFeatureIntroDialogContext } from '@/services/feature-intro/context'

import { Card } from './constants'

type JoinUsCardProps = {
  card: Card
}

function JoinUsCard({ card }: JoinUsCardProps) {
  const { openDialog } = useFeatureIntroDialogContext()

  const handleButtonClick = () => {
    if (card.actionType === 'dialog') {
      openDialog()
    }
  }

  const getButtonContent = () => {
    if (card.actionType === 'dialog') {
      return (
        <Button variant="secondary" size={44} onClick={handleButtonClick}>
          {card.buttonText}
        </Button>
      )
    }

    if (card.actionType === 'mailto') {
      return (
        <Button variant="secondary" size={44} asChild>
          <a href={`mailto:${card.actionValue}`}>{card.buttonText}</a>
        </Button>
      )
    }

    // external link
    return (
      <Button variant="secondary" size={44} asChild>
        <a href={card.actionValue} target="_blank" rel="noopener noreferrer">
          {card.buttonText}
        </a>
      </Button>
    )
  }

  const getExtraButtonContent = () => {
    if (card.extraButtonText && card.extraActionValue) {
      return (
        <a
          href={card.extraActionValue}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 prose-p1-bold text-neutral-900 underline underline-offset-[3px] transition-colors duration-200 hover:text-red-400"
        >
          {card.extraButtonText}
        </a>
      )
    }
    return null
  }

  return (
    <div
      id={card.anchorId}
      className={cn(
        'flex h-full flex-col rounded-3xl border-2 border-neutral-200 bg-neutral-white',
        card.anchorId && 'scroll-margin-anchor'
      )}
    >
      <div className="flex flex-1 flex-col p-6 desktop:p-8">
        <h3 className="mb-3 flex items-center gap-3 prose-p1-bold text-neutral-900 desktop:prose-h6-large">
          <Image
            src={card.icon}
            alt={`${card.title} icon`}
            className="size-8 desktop:size-10"
            width={32}
            height={32}
          />
          {card.title}
        </h3>
        <p className="mb-4 prose-p1 text-neutral-700 desktop:mb-5">
          {card.description}
        </p>
        <div className="mt-auto flex items-center gap-2">
          {getButtonContent()}
          {getExtraButtonContent()}
        </div>
      </div>
    </div>
  )
}

export default JoinUsCard
