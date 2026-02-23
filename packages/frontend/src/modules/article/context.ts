import { createContext, useContext } from 'react'

import { FontSizeLevel } from '@/constants'

type Article = {
  fontSize: FontSizeLevel
  onFontSizeChange: () => void
  onImageModalOpen: (
    imgProps: React.ImgHTMLAttributes<HTMLImageElement>
  ) => void
  onImageModalClose: () => void
}

export const ArticleContext = createContext<Article>({
  fontSize: FontSizeLevel.NORMAL,
  onFontSizeChange: () => undefined,
  onImageModalOpen: () => undefined,
  onImageModalClose: () => undefined,
})

export const useArticleContext = () => useContext(ArticleContext)
