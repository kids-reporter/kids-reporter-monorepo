/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { ThemeColorEnum } from './utils/color'

export enum FontSizeLevel {
  NORMAL = 'normal',
  LARGE = 'large',
}

declare module 'styled-components' {
  export interface DefaultTheme {
    themeColor?: ThemeColorEnum
    fontSizeLevel?: FontSizeLevel
    offsetTop?: number
    onImageModalOpen?: (
      imgProps: React.ImgHTMLAttributes<HTMLImageElement>
    ) => void
  }
}
