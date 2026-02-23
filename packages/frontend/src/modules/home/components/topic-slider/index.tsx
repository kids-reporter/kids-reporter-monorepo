'use client'
import 'swiper/css'

import Image from 'next/image'
import { useRef } from 'react'
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Swiper as SwiperCore } from 'swiper/types'

import SwiperButton from './swiper-button'
import TopicCard from './topic-card'
import WaveIllustrations from './wave-illustrations'

type TopicSliderProp = {
  topics: { url: string; image: string; title: string; subtitle: string }[]
}

function TopicSlider({ topics }: TopicSliderProp) {
  const swiperRef = useRef<SwiperCore>()
  const topicNum = topics?.length

  if (!topicNum || topicNum === 0) {
    return null
  }

  return (
    <div className="relative">
      <div
        role="presentation"
        className='absolute -top-(--mobile-header-height) left-0 z-1 h-[calc(100%+var(--mobile-header-height))] w-full bg-[url("/assets/images/home/background.svg")] bg-cover bg-center desktop:-top-(--desktop-header-height) desktop:h-[calc(100%+var(--desktop-header-height))]'
      ></div>
      <div className="relative z-3 flex w-screen flex-col items-center justify-center pt-6 pb-6 tablet:pb-20 desktop:pt-10 desktop:pb-24 hd:pt-12 hd:pb-30">
        <div className="relative z-2 flex w-full flex-row items-center justify-center">
          <Swiper
            className="h-full !w-full"
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper
            }}
            modules={[Navigation]}
            loop
            rewind
            slidesPerView={1}
            // spaceBetween={20}
            centeredSlides
            breakpoints={{
              768: {
                slidesPerView: 'auto',
                spaceBetween: 32,
              },
              1024: {
                slidesPerView: 'auto',
                spaceBetween: 48,
              },
              1440: {
                slidesPerView: 'auto',
                spaceBetween: 56,
              },
            }}
          >
            {topics.map((topic) => {
              return (
                <SwiperSlide
                  key={topic.title}
                  className="!h-auto tablet:!w-auto"
                >
                  <TopicCard
                    url={topic.url}
                    image={topic.image}
                    title={topic.title}
                    subtitle={topic.subtitle}
                  />
                </SwiperSlide>
              )
            })}
          </Swiper>
          <SwiperButton
            variant="prev"
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute top-[calc(30vw-20px)] left-0 z-[900] -translate-y-1/2 scale-[0.625] tablet:top-42 tablet:left-[calc(50%-320px)] tablet:-translate-x-1/2 desktop:top-52 desktop:left-[calc(50%-416px)] desktop:scale-100 hd:top-62 hd:left-[calc(50%-544px)] hd:scale-100"
          />
          <SwiperButton
            variant="next"
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute top-[calc(30vw-20px)] right-0 z-[900] -translate-y-1/2 scale-[0.625] tablet:top-42 tablet:right-[calc(50%-320px)] tablet:translate-x-1/2 desktop:top-52 desktop:right-[calc(50%-416px)] desktop:scale-100 hd:top-62 hd:right-[calc(50%-544px)] hd:scale-100"
          />
        </div>
        <WaveIllustrations />
        <Image
          src="/assets/images/home/topic_baodaozai_illustration_s.svg"
          alt="topic baodaozai illustration"
          width={200}
          height={100}
          className="absolute right-2 bottom-10 z-4 tablet:hidden"
        />
        <Image
          src="/assets/images/home/topic_baodaozai_illustration_m.svg"
          alt="topic baodaozai illustration"
          width={256}
          height={128}
          className="absolute bottom-0 left-1/2 z-4 hidden -translate-x-[calc(50%+168px)] tablet:block desktop:hidden"
        />
        <Image
          src="/assets/images/home/topic_baodaozai_illustration_l.svg"
          alt="topic baodaozai illustration"
          width={336}
          height={168}
          className="absolute bottom-0 left-1/2 z-4 hidden -translate-x-[calc(50%+208px)] desktop:block hd:hidden"
        />
        <Image
          src="/assets/images/home/topic_baodaozai_illustration_l.svg"
          alt="topic baodaozai illustration"
          width={336}
          height={168}
          className="absolute bottom-0 left-1/2 z-4 hidden -translate-x-[calc(50%+320px)] hd:block"
        />
      </div>
    </div>
  )
}

export default TopicSlider
