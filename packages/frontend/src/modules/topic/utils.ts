import { FALLBACK_IMG } from '@/constants'

export const normalizePhoto = (photo: {
  resized?: { small?: string; medium?: string; large?: string }
}) => {
  return {
    resized: {
      small: photo.resized?.small ?? FALLBACK_IMG,
      medium: photo.resized?.medium ?? photo.resized?.small ?? FALLBACK_IMG,
      large:
        photo.resized?.large ??
        photo.resized?.medium ??
        photo.resized?.small ??
        FALLBACK_IMG,
    },
  }
}
