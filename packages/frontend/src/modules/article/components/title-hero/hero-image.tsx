import { GetPostQuery } from '__generated__/operations/content.generated'
import { cn, useMediaQuery } from '@kids-reporter/routing-ui'
import dynamic from 'next/dynamic'
import { useState } from 'react'

import { FALLBACK_IMG, FontSizeLevel } from '@/constants'

const ImageWithFallback = dynamic(
  () => import('@/components/image-with-fallback'),
  { ssr: false }
)

type HeroImageProp = {
  image: NonNullable<GetPostQuery['post']>['heroImage']
  caption: string
  onImageModalOpen: (
    imgProps: React.ImgHTMLAttributes<HTMLImageElement>
  ) => void
  fontSizeLevel: FontSizeLevel
}

function HeroImage({
  image,
  caption,
  onImageModalOpen,
  fontSizeLevel,
}: HeroImageProp) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [isLoading, setIsLoading] = useState(true)
  const aspectRatio =
    image?.imageFile?.width && image?.imageFile?.height
      ? `${image.imageFile.width}/${image.imageFile.height}`
      : '16/9'

  const commonImgProps = {
    sizes: '(min-width: 1100px) 1000px, 90vw',
    srcSet: `${image?.resized?.small} 320w, ${image?.resized?.medium} 500w, ${image?.resized?.large} 1000w`,
    src: image?.resized?.medium ?? FALLBACK_IMG,
  }

  return (
    <figure className="mx-auto pt-10 hd:w-[1058px]">
      <div
        className="relative inline-flex w-full overflow-hidden"
        style={{
          aspectRatio: aspectRatio,
        }}
      >
        {isLoading && (
          <div
            className="absolute inset-0 animate-pulse bg-neutral-200"
            aria-hidden="true"
          />
        )}
        {image && (
          <ImageWithFallback
            className={cn(
              'max-w-full object-fill',

              isLoading && 'opacity-0'
            )}
            {...commonImgProps}
            style={{
              width: 'inherit',
              height: 'auto',
              aspectRatio: aspectRatio,
              cursor: isDesktop ? 'zoom-in' : 'default',
            }}
            loading="eager"
            fetchPriority="high"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            onClick={
              isDesktop ? () => onImageModalOpen(commonImgProps) : undefined
            }
          />
        )}
      </div>
      <figcaption
        className={cn(
          'mx-4 mt-1 max-w-[1058px] pt-2.5 text-center prose-p2 text-neutral-700 tablet:mx-8',
          fontSizeLevel === FontSizeLevel.LARGE && 'text-[17.5px]'
        )}
      >
        {caption}
      </figcaption>
    </figure>
  )
}

export default HeroImage
