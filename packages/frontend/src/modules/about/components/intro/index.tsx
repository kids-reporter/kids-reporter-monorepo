import Image from 'next/image'

import WaveIllustrations from './wave-illustrations'

function Intro() {
  return (
    <section
      id="mission"
      className="relative w-full max-w-300 scroll-margin-anchor bg-neutral-white"
    >
      <div className="relative z-1 flex w-full flex-col gap-6 px-6 pt-6 pb-[29px] tablet:flex-row tablet:items-center tablet:justify-center tablet:px-8 tablet:pt-8 tablet:pb-[69px] desktop:items-center desktop:gap-8 desktop:px-12 desktop:pt-12 desktop:pb-[74px] hd:translate-x-[52px] hd:gap-22 hd:pt-16 hd:pb-[84px]">
        <div className="flex w-full flex-1 flex-col gap-3 tablet:ml-8 desktop:ml-12 hd:-mt-px hd:ml-0 hd:max-w-120">
          <h1 className="prose-h2-small font-swei! text-neutral-900 desktop:prose-h2-large hd:prose-h1-large">
            理解世界,參與未來
          </h1>
          <p className="prose-p1 text-neutral-700">
            《少年報導者》是由非營利媒體《報導者》為10～15歲的同學打造的新聞平台，不僅製作深度報導，也提供公共參與的管道，每一篇文章都是記者獨立採訪、專家審核把關下完成。我們把每個兒童和少年當成獨立的大人，讓兒少不只是新聞的探索者、議題的提問者、更可以是發動改變的倡議者。
          </p>
        </div>

        <div className="w-full flex-1 tablet:mt-4 tablet:shrink-0 desktop:mt-0">
          <Image
            src="/assets/images/about/intro/illustration.svg"
            alt="少年報導者介紹圖"
            className="mx-auto w-full max-w-120"
            loading="eager"
            width={327}
            height={273}
            priority
          />
        </div>
      </div>

      <WaveIllustrations />
    </section>
  )
}

export default Intro
