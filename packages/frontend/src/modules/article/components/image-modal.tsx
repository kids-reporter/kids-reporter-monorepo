import { cn } from '@kids-reporter/routing-ui'
import { useEffect, useState } from 'react'

import { XIcon } from '@/icons/miscellaneous'

type ImageModalProps = {
  isOpen: boolean
  imgProps: React.ImgHTMLAttributes<HTMLImageElement>
  onImageModalClose: () => void
}

function ImageModal({ isOpen, imgProps, onImageModalClose }: ImageModalProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  useEffect(() => {
    const handleESCPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onImageModalClose()
      }
    }
    window.addEventListener('keydown', handleESCPress)
    return () => {
      window.removeEventListener('keydown', handleESCPress)
    }
  }, [onImageModalClose])

  useEffect(() => {
    if (!isOpen) {
      setIsImageLoaded(false)
    }
  }, [isOpen])

  return (
    isOpen && (
      <div className="fixed top-0 left-0 z-overlay hidden h-screen w-screen items-center justify-center bg-black/50 lg:flex lg:flex-col">
        <div className="relative">
          <div
            className={cn(
              'z-1 flex h-screen w-screen items-center justify-center bg-neutral-200/50',
              isImageLoaded && 'hidden'
            )}
          >
            <div className="size-12 animate-spin rounded-full border-10 border-neutral-300 border-t-neutral-600" />
          </div>
          <img
            className={cn(
              'relative z-2 max-h-screen max-w-screen object-contain',
              !isImageLoaded && 'hidden'
            )}
            loading="eager"
            onLoad={() => {
              setIsImageLoaded(true)
            }}
            {...imgProps}
          />
          <button
            className="absolute top-6 right-6 z-2 flex size-10 cursor-pointer items-center justify-center gap-1 rounded-full bg-neutral-white/30 text-neutral-white transition-all duration-200 hover:bg-neutral-white/50"
            onClick={onImageModalClose}
          >
            <XIcon />
          </button>
        </div>
      </div>
    )
  )
}

export default ImageModal
