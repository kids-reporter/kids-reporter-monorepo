'use client'
import { FALLBACK_IMG } from '@/constants'

export const ImageWithFallback = (
  props: React.ImgHTMLAttributes<HTMLImageElement>
) => {
  return (
    <img
      {...props}
      src={props.src || FALLBACK_IMG}
      onError={(e) => {
        const currentTarget = e.currentTarget
        if (
          currentTarget.src === FALLBACK_IMG ||
          currentTarget.src.endsWith(FALLBACK_IMG)
        ) {
          currentTarget.onerror = null
          return
        }
        currentTarget.onerror = null
        currentTarget.src = FALLBACK_IMG
        currentTarget.srcset = ''
        props.onError?.(e)
      }}
    />
  )
}

export default ImageWithFallback
