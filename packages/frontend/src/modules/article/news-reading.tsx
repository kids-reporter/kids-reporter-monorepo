'use client'

import { GetPostQuery } from '__generated__/operations/content.generated'
import { useMemo, useState } from 'react'
import styled from 'styled-components'

import { Color } from '@/constants'
import { RecursiveNonNullable } from '@/types/utils'
import { mediaQuery } from '@/utils/media-query'

const Title = styled.h3`
  color: #232323;
  font-size: 16px;
  font-weight: 700;
  line-height: 26px;
  text-align: center;

  margin-top: 15px;
  margin-bottom: 10px;
`

const Buttons = styled.div`
  margin-left: auto;
  margin-right: auto;

  width: 100%;
  padding-bottom: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;

  ${mediaQuery.mediumAbove} {
    width: 500px;
  }
`

const Button = styled.div<{ isActive: boolean }>`
  ${({ isActive }) => {
    return isActive
      ? `
      border-color: #27B5F7;
      color: ${Color.DARK_GRAY};
    `
      : `
      border-color: #EAEAEA;
      color: #A3A3A3;
    `
  }}

  &:hover {
    color: ${Color.DARK_GRAY};
  }

  border-width: 2.5px;
  border-style: solid;
  border-radius: 30px;

  line-height: 30px;
  width: 75px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;

  cursor: pointer;

  ${mediaQuery.mediumAbove} {
    width: 90px;
  }
`

const Container = styled.div`
  max-width: 600px;
  width: 100%;
  border: 1px solid #eaeaea;
  border-radius: 20px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 70px;
`

const Divider = styled.div`
  border: 1px solid #eaeaea;
`

const IframeContainer = styled.div`
  padding: 20px 15px;
`

type NewsReadingProps = {
  className?: string
  items: RecursiveNonNullable<GetPostQuery['post']>['newsReadingGroup']['items']
}

const NewsReading = ({ className, items }: NewsReadingProps) => {
  const options = useMemo(
    () =>
      items.map((item) => {
        return {
          name: item?.name ?? '',
          value: item?.name ?? '',
        }
      }),
    [items]
  )

  const [selectedOption, setSelectedOption] = useState(options[0])
  const selectedReading = items.find((r) => r?.name === selectedOption?.value)

  if (items.length === 0) {
    return null
  }

  const buttons = options.map((option, idx) => {
    return (
      <Button
        key={idx}
        isActive={option.value === selectedOption.value}
        onClick={() => setSelectedOption(option)}
      >
        {option.name}
      </Button>
    )
  })

  return (
    <Container className={className}>
      <Title>讀報</Title>
      <Buttons>{buttons}</Buttons>
      <Divider />
      {selectedReading?.embedCode && (
        <IframeContainer>
          <div
            dangerouslySetInnerHTML={{ __html: selectedReading.embedCode }}
          />
        </IframeContainer>
      )}
    </Container>
  )
}

export { NewsReading }
export default NewsReading
