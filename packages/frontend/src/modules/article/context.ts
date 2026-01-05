import { createContext, useContext } from 'react'

import { FontSizeLevel } from '@/constants'

type Article = {
  fontSize: FontSizeLevel
  onFontSizeChange: () => void
  handleImgModalOpen: (
    imgProps: React.ImgHTMLAttributes<HTMLImageElement>
  ) => void
  handleImgModalClose: () => void
}

export const ArticleContext = createContext<Article>({
  fontSize: FontSizeLevel.NORMAL,
  onFontSizeChange: () => undefined,
  handleImgModalOpen: () => undefined,
  handleImgModalClose: () => undefined,
})

export const useArticleContext = () => useContext(ArticleContext)
