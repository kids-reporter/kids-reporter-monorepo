'use client'

import Image from 'next/image'

import { COLLABORATIONS } from './constants'

function CrossBorderCollaboration() {
  return (
    <section
      id="partner"
      className="mx-auto flex w-full max-w-300 scroll-margin-anchor flex-col items-center justify-center px-6 pb-20 tablet:px-8 tablet:pb-24 desktop:px-12 desktop:pb-32 hd:px-14 hd:pb-36"
    >
      <h2 className="mb-6 flex items-center gap-2 self-start prose-h2-small !font-swei text-neutral-900 desktop:mb-10 desktop:prose-h2-large">
        <Image
          src="/assets/images/about/cross-border-collaboration/icon.svg"
          alt="Cross-Border Collaboration"
          className="size-11 desktop:size-16"
          width={64}
          height={64}
        />
        跨界合作
      </h2>

      <div className="flex w-full flex-col gap-6 desktop:grid desktop:grid-cols-2 desktop:gap-x-12 desktop:gap-y-8 hd:gap-x-14">
        {COLLABORATIONS.map((collaboration) => {
          const imagePath = `/assets/images/about/cross-border-collaboration/${collaboration.image}`

          return (
            <div
              key={collaboration.id}
              className="flex w-full flex-row items-start gap-4"
            >
              <div className="relative aspect-square size-30 overflow-hidden rounded-[12px]">
                <Image
                  src={imagePath}
                  alt={collaboration.title}
                  className="h-full w-full object-cover"
                  fill
                  sizes="(max-width: 768px) 120px, (max-width: 1024px) 150px, 180px"
                />
              </div>

              <div className="flex flex-1 flex-col justify-center gap-2">
                <h3 className="prose-h6-small text-neutral-900 desktop:prose-h6-large">
                  {collaboration.title}
                </h3>
                <p className="prose-p1 text-neutral-700">
                  {collaboration.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default CrossBorderCollaboration
