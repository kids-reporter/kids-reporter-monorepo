import styled from 'styled-components'

import { mediaQuery } from '../utils/media-query'

const BorderLeftContainer = styled.blockquote`
  display: flex;
  gap: 16px;
`

const BorderLeftLine = styled.div`
  width: 4px;
  border-radius: 10px;
  background-color: #c6c6c6;
  align-self: stretch;
  flex-shrink: 0;
`

export function BorderLeftBlockquote({ text }: { text: string }) {
  return (
    <BorderLeftContainer>
      <BorderLeftLine />
      <QuoteText>{text}</QuoteText>
    </BorderLeftContainer>
  )
}

const QuoteLeftContainer = styled.blockquote`
  margin: 0;
  padding: 24px;
  background-color: #f4f4f4;
  display: flex;
  border-radius: 20px;

  ${mediaQuery.smallOnly} {
    padding: 20px;
  }
`

const QuoteText = styled.p`
  margin: 0;
  word-break: break-word;
  font-size: ${({ theme }) =>
    theme?.fontSizeLevel === 'large' ? '22px' : '18px'};
  font-weight: 700;
  letter-spacing: 0.9px;
  line-height: 2;
  color: #232323;
`

const SvgBlock = styled.div`
  svg {
    fill: #27b3f5;
    width: 32px;
    margin-right: 16px;
  }
`

function QuoteSvg() {
  return (
    <SvgBlock>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 50 50"
        aria-hidden="true"
      >
        <path d="M9.4 14.6c-2.4 2.9-3.6 5.9-3.6 8.9 0 1.3.2 2.4.5 3.3 1.8-1.4 3.8-2.1 6-2.1 2.9 0 5.3.9 7.3 2.7 2 1.8 3 4.2 3 7.3 0 1.9-.5 3.6-1.4 5.1-.9 1.5-2.2 2.7-3.8 3.6s-3.3 1.3-5.1 1.3c-4.1 0-7.3-1.6-9.5-4.9C.9 36.9 0 33.5 0 29.4c0-5.2 1.4-9.9 4.1-14 2.8-4.1 6.9-7.5 12.5-10l1.5 2.8c-3.3 1.3-6.2 3.5-8.7 6.4zm27.5 0c-2.4 2.9-3.6 5.9-3.6 8.9 0 1.3.2 2.4.5 3.3 1.8-1.4 3.8-2.1 6-2.1 2.9 0 5.4.9 7.4 2.7 2 1.8 3 4.2 3 7.3 0 2.8-1 5.2-3 7.1-2 1.9-4.4 2.9-7.3 2.9-4.1 0-7.3-1.6-9.5-4.9-1.8-2.7-2.8-6.2-2.8-10.3 0-5.2 1.4-9.9 4.1-14 2.8-4.1 6.9-7.5 12.5-10l1.5 2.8c-3.5 1.2-6.4 3.4-8.8 6.3z"></path>
      </svg>
    </SvgBlock>
  )
}

export function QuoteLeftBlockquote({ text }: { text: string }) {
  return (
    <QuoteLeftContainer>
      <QuoteSvg />
      <QuoteText>{text}</QuoteText>
    </QuoteLeftContainer>
  )
}

const ArticleBodyContainer = styled.div`
  max-width: 512px;
  margin: 0 auto 38px auto;

  ${mediaQuery.smallOnly} {
    margin-bottom: 38px;
  }

  ${mediaQuery.largeOnly} {
    max-width: 584px;
  }

  ${mediaQuery.smallOnly} {
    width: 100%;
    padding-left: 24px;
    padding-right: 24px;
  }
`

enum BlockquoteTypeEnum {
  borderLeft = 'border_left',
  quoteLeft = 'quote_left',
}

export type BlockquoteProps = {
  className?: string
  data?: {
    type: BlockquoteTypeEnum
    text: string
  }
}

export function BlockquoteInArticleBody({
  className = '',
  data = {
    type: BlockquoteTypeEnum.borderLeft,
    text: '',
  },
}: BlockquoteProps) {
  const { type, text } = data
  const BlockQuote =
    type === BlockquoteTypeEnum.quoteLeft
      ? QuoteLeftBlockquote
      : BorderLeftBlockquote
  return (
    <ArticleBodyContainer className={className}>
      <BlockQuote text={text} />
    </ArticleBodyContainer>
  )
}
