import { FontSizeLevel } from '@/constants'

type TitleProp = {
  text: string
  subtitle?: string
  fontSize?: FontSizeLevel
}

export const Title = ({
  text,
  subtitle = '',
  fontSize = FontSizeLevel.NORMAL,
}: TitleProp) => {
  return (
    <>
      {subtitle && <div className="subtitle">{subtitle}</div>}
      <h1
        className={`title ${subtitle ? 'mt-5' : 'mt-20'} ${
          fontSize === FontSizeLevel.LARGE ? 'large' : ''
        }`}
      >
        {text}
      </h1>
    </>
  )
}

export default Title
