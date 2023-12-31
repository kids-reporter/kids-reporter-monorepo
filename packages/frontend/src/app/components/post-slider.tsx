'use client'
import { useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Swiper as SwiperCore } from 'swiper/types'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import PostCard from '@/app/components/post-card'
import { ArrowLeft, ArrowRight } from '@/app/icons/arrow'
import { Theme, DEFAULT_THEME_COLOR } from '@/app/constants'
import { getThemeColor } from '@/app/utils'
import { PostSummary } from '@/app/components/types'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import './post-slider.scss'

export type PostSliderProp = {
  posts: PostSummary[]
  sliderTheme: Theme
  isSimple?: boolean
  enablePagination?: boolean
}

const slidesPerView = 3
const autoPlayInterval = 5000

export const PostSlider = ({
  posts,
  sliderTheme,
  isSimple = false,
  enablePagination = true,
}: PostSliderProp) => {
  const postNum = posts?.length
  const themeColor = getThemeColor(sliderTheme) ?? DEFAULT_THEME_COLOR

  // Note: swiper loop mode is only available when slideNum >= slidesPerView * 2
  // ref: https://swiperjs.com/swiper-api#param-loop
  const isLoopAvailable = postNum >= slidesPerView * 2

  // Note: for swiper custom navigation buttons
  // https://github.com/nolimits4web/swiper/issues/3855#issuecomment-1287871054
  const swiperRef = useRef<SwiperCore>()

  return (
    postNum > 0 && (
      <div className={`post-slider theme-${sliderTheme}`}>
        <div className="cards">
          {postNum === 1 ? (
            posts[0] && (
              <div className="single">
                <PostCard post={posts[0]} />
              </div>
            )
          ) : (
            <>
              <Swiper
                autoplay={{ delay: autoPlayInterval }}
                onBeforeInit={(swiper) => {
                  swiperRef.current = swiper
                }}
                pagination={{ enabled: enablePagination, clickable: true }}
                modules={[Autoplay, Navigation, Pagination]}
                loop={isLoopAvailable}
                rewind={!isLoopAvailable}
                spaceBetween={20}
                slidesPerView={1}
                breakpoints={{
                  1000: {
                    slidesPerView: postNum > 2 ? 3 : 2,
                  },
                  730: {
                    slidesPerView: 2,
                  },
                }}
              >
                {posts.map((post, index) => {
                  return (
                    post && (
                      <SwiperSlide key={`swiper-slide-${index}`}>
                        <PostCard post={post} isSimple={isSimple} />
                      </SwiperSlide>
                    )
                  )
                })}
              </Swiper>
              <button
                className="prev-btn"
                onClick={() => swiperRef.current?.slidePrev()}
              >
                <ArrowLeft color={themeColor} />
              </button>
              <button
                className="next-btn"
                onClick={() => swiperRef.current?.slideNext()}
              >
                <ArrowRight color={themeColor} />
              </button>
            </>
          )}
        </div>
      </div>
    )
  )
}

export default PostSlider
