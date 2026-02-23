'use client'

import { cn } from '@kids-reporter/routing-ui'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/dialog'
import { PlayIcon, PlayIconLarge, XIcon } from '@/icons/miscellaneous'

const YOUTUBE_VIDEO_ID = 'Hu5NgkSqSpQ'
const YOUTUBE_EMBED_URL = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}`
const YOUTUBE_THUMBNAIL_URL = `https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/maxresdefault.jpg`

function VideoPlayer() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInViewport, setIsInViewport] = useState(false)
  const changedToVideoRef = useRef(false)
  const videoRef = useRef<HTMLDivElement>(null)

  const handlePauseVideo = useCallback(() => {
    const video = videoRef.current?.querySelector('iframe') as HTMLIFrameElement
    if (!video) return
    video.contentWindow?.postMessage(
      '{"event":"command","func":"pauseVideo","args":""}',
      '*'
    )
  }, [])

  const handlePlayVideo = useCallback(() => {
    const video = videoRef.current?.querySelector('iframe') as HTMLIFrameElement
    if (!video) return
    video.contentWindow?.postMessage(
      '{"event":"command","func":"playVideo","args":""}',
      '*'
    )
  }, [])

  useEffect(() => {
    const element = videoRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (changedToVideoRef.current) {
            if (entry.isIntersecting) {
              handlePlayVideo()
            } else {
              handlePauseVideo()
            }
            return
          }
          if (!entry.isIntersecting) return

          setIsInViewport(entry.isIntersecting)
          changedToVideoRef.current = true
          if (entry.isIntersecting) {
            handlePlayVideo()
          } else {
            handlePauseVideo()
          }
        })
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.5,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [handlePauseVideo, handlePlayVideo])

  const handleModalOpen = () => {
    setIsModalOpen(true)
  }

  return (
    <>
      <div
        ref={videoRef}
        className="relative aspect-video w-full overflow-hidden rounded-3xl"
      >
        {isInViewport ? (
          <>
            <iframe
              src={`${YOUTUBE_EMBED_URL}?autoplay=1&mute=1&enablejsapi=1&showinfo=0&controls=0&rel=0`}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="讀者推薦影片"
            />
            <div
              className={cn(
                'absolute inset-0 z-5 bg-neutral-900 opacity-0 transition-opacity duration-300',
                isModalOpen && 'pointer-events-none opacity-100'
              )}
            ></div>
            <button
              className="group absolute inset-0 z-10 cursor-pointer"
              onClick={handleModalOpen}
              aria-label="Open video in modal"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 [&_path]:first-of-type:opacity-60 group-hover:[&_path]:first-of-type:opacity-40">
                <PlayIcon className="desktop:hidden" />
                <PlayIconLarge className="hidden desktop:block" />
              </div>
            </button>
          </>
        ) : (
          <div
            className="group relative h-full w-full cursor-pointer"
            onClick={handleModalOpen}
          >
            <img
              src={YOUTUBE_THUMBNAIL_URL}
              alt="讀者推薦影片"
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-neutral-900/30"></div>
            <div className="absolute bottom-6 left-6 flex flex-col gap-2">
              <p className="prose-h5-small text-neutral-white desktop:prose-h4-small">
                請問家長們
              </p>
              <p className="prose-p1 text-neutral-white desktop:prose-h6-small">
                當兒少碰上新聞...
              </p>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 [&_path]:first-of-type:opacity-60 group-hover:[&_path]:first-of-type:opacity-40">
              <PlayIcon className="desktop:hidden" />
              <PlayIconLarge className="hidden desktop:block" />
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open)
        }}
      >
        <DialogTitle className="sr-only">讀者推薦影片</DialogTitle>
        <DialogContent
          className="flex max-w-5xl items-center justify-center p-0 tablet:p-6 desktop:p-8"
          showCloseButton={false}
        >
          <div className="relative aspect-video w-full">
            <DialogClose className="absolute -top-9 right-0 z-2 flex size-5 cursor-pointer items-center justify-center rounded-xs text-neutral-white opacity-70 transition-colors transition-opacity duration-300 hover:text-neutral-200 hover:opacity-100 disabled:pointer-events-none desktop:-top-9 desktop:-right-9 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5">
              <XIcon />
              <span className="sr-only">Close</span>
            </DialogClose>
            <div className="relative z-1 aspect-video w-full overflow-hidden rounded-3xl">
              <iframe
                src={YOUTUBE_EMBED_URL}
                className="absolute inset-0 h-full w-full rounded-3xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="讀者推薦影片"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default VideoPlayer
