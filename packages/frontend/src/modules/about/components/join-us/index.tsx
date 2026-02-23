'use client'

import Image from 'next/image'

import { JOIN_US_CARDS } from './constants'
import JoinUsCard from './join-us-card'

function JoinUs() {
  return (
    <section
      id="join"
      className="mx-auto flex w-full max-w-300 scroll-margin-anchor flex-col items-center justify-center px-6 pt-41 pb-14 tablet:px-8 tablet:pt-49 tablet:pb-16 desktop:px-12 desktop:pt-76 desktop:pb-24 hd:px-14 hd:pt-82 hd:pb-30"
    >
      <div className="relative w-full grid-cols-1 gap-6 rounded-[40px] bg-neutral-100 p-6 pt-20 tablet:p-8 tablet:pt-20 desktop:p-14 desktop:pt-20">
        <Image
          src="/assets/images/about/join-us/illustration.svg"
          alt="Join Us"
          className="absolute bottom-[calc(100%-56px)] left-1/2 h-45 w-70 -translate-x-1/2 tablet:bottom-[calc(100%-56px)] tablet:h-51 tablet:w-80 desktop:bottom-[calc(100%-48px)] desktop:h-64 desktop:w-100"
          width={280}
          height={180}
        />
        <h2 className="mb-6 text-center prose-h2-small !font-swei text-neutral-900 tablet:mb-8 tablet:px-0 desktop:mb-10 desktop:prose-h2-large">
          參與我們
        </h2>
        <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:gap-8">
          {JOIN_US_CARDS.map((card) => (
            <JoinUsCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default JoinUs
