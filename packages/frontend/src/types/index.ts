export type Photo = {
  imageFile?: {
    width: number
    height: number
  }
  resized?: {
    small: string
    medium: string
    large: string
  }
}

export type CategorySlug =
  | 'news'
  | 'storytelling'
  | 'campus'
  | 'listening-news'
  | 'classroom'

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'hd'
