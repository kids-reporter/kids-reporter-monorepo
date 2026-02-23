'use client'

import 'swiper/css'
import 'swiper/css/navigation'

import Image from 'next/image'
import { useRef } from 'react'
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Swiper as SwiperCore } from 'swiper/types'

import { TESTIMONIALS } from './constants'
import SwiperButton from './swiper-button'
import TestimonialCard from './testimonial-card'
import VideoPlayer from './video-player'

function RecommendationsSection() {
  const swiperRef = useRef<SwiperCore>()
  return (
    <section id="voices" className="w-full scroll-margin-anchor bg-yellow-200">
      <div className="mx-auto flex w-full max-w-300 flex-col items-center justify-center pt-10 pb-14 tablet:pt-12 tablet:pb-16 desktop:px-12 desktop:pt-18 desktop:pb-24 hd:px-14 hd:pt-24 hd:pb-30">
        <h2 className="mb-6 flex items-center gap-2 px-6 prose-h2-small !font-swei text-neutral-900 tablet:mb-8 tablet:px-8 desktop:mb-10 desktop:px-0 desktop:prose-h2-large">
          <Image
            src="/assets/images/about/reader-recommendations/icon.svg"
            alt="Reader Recommendations"
            className="size-11 desktop:size-16"
            width={64}
            height={64}
          />
          讀者推薦
        </h2>

        <div className="mb-10 w-full px-6 tablet:mb-12 tablet:px-22 desktop:mb-14 desktop:px-40 hd:mb-16 hd:px-37.5">
          <VideoPlayer />
        </div>
        <div className="flex w-full max-w-300 gap-5">
          <SwiperButton
            className="hidden desktop:block"
            onClick={() => swiperRef.current?.slidePrev()}
            type="prev"
          />
          <Swiper
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper
            }}
            spaceBetween={24}
            slidesPerView="auto"
            centeredSlides
            loop
            modules={[Navigation]}
            breakpoints={{
              768: {
                spaceBetween: 24,
                loop: true,
                centeredSlides: true,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 32,
                centeredSlides: false,
              },
              1440: {
                slidesPerView: 3,
                spaceBetween: 32,
                centeredSlides: false,
              },
            }}
          >
            {TESTIMONIALS.map((testimonial) => {
              return (
                <SwiperSlide
                  key={testimonial.id}
                  className="!h-auto [@media(max-width:767px)]:!w-70 [@media(min-width:768px)_and_(max-width:1023px)]:!w-80"
                >
                  <TestimonialCard testimonial={testimonial} />
                </SwiperSlide>
              )
            })}
          </Swiper>
          <SwiperButton
            className="hidden desktop:block"
            onClick={() => swiperRef.current?.slideNext()}
            type="next"
          />
        </div>
      </div>
    </section>
  )
}

export default RecommendationsSection
