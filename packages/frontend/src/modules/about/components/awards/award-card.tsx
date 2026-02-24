'use client'

import Link from 'next/link'

import { KIDS_URL_ORIGIN } from '@/constants'

import { AwardCard as AwardCardType } from './constants'

type AwardCardProps = {
  card: AwardCardType
}

function isInternalHref(href: string) {
  return href.startsWith(KIDS_URL_ORIGIN) || href.startsWith('/')
}

function AwardCard({ card }: AwardCardProps) {
  return (
    <div className="flex gap-3 rounded-3xl border-2 border-neutral-200 bg-neutral-white p-6">
      <div
        className="mt-1.5 h-5 w-1 shrink-0 self-stretch rounded-[6px] bg-red-400"
        aria-hidden
      />
      <div className="flex flex-1 flex-col">
        <h3 className="mb-2 prose-h6-large text-neutral-900">{card.title}</h3>
        <p className="mb-1 prose-p1 text-neutral-900">
          {card.workParts.map((part) => {
            if (part.type === 'text') {
              return <span key={part.value}>{part.value}</span>
            }
            const href = part.href
            if (isInternalHref(href)) {
              const path = href.startsWith(KIDS_URL_ORIGIN)
                ? href.slice(KIDS_URL_ORIGIN.length) || '/'
                : href
              return (
                <Link
                  key={part.value}
                  href={path}
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {part.value}
                </Link>
              )
            }
            return (
              <a
                key={part.value}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {part.value}
              </a>
            )
          })}
        </p>
        <p className="prose-p2 text-neutral-700">{card.team}</p>
      </div>
    </div>
  )
}

export default AwardCard
