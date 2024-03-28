'use client'
import { useState } from 'react'
import styled from 'styled-components'
import { mediaQuery } from '@/app/utils/media-query'
import { STICKY_HEADER_HEIGHT, ThemeColor } from '@/app/constants'

const zIndex = 1000

const TOCContainer = styled.div`
  position: fixed;
  width: 90px;
  top: 0;
  left: 0;
  transform: translateY(-50%);
  z-index: ${zIndex};
`

const TOCTab = styled.div<{ isExpanded: boolean }>`
  width: 30px;
  position: fixed;
  z-index: ${zIndex};
  top: 245px;
  left: 0;
  transition: transform 0.1s ease-in-out 0.1s;
  transform: ${(props) =>
    props.isExpanded ? `translateX(160px)` : 'translateX(0px)'};
  ${mediaQuery.mediumAbove} {
    transform: ${(props) =>
      props.isExpanded ? `translateX(180px)` : 'translateX(0px)'};
  }
  cursor: pointer;

  > div {
    width: 30px;
    height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    color: #8e8e8e;
    background-color: #f4f4f4;
    border-radius: 0px 15px 15px 0px;
    padding-top: 25px;
    padding-bottom: 25px;
    font-size: 14px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`
const TOCBackground = styled.div<{ isExpanded: boolean }>`
  width: 160px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  position: fixed;
  z-index: ${zIndex};
  top: 220;
  left: 0;
  background-color: #f4f4f4;
  transition: transform 0.1s ease-in-out 0.1s;
  transform: ${(props) =>
    props.isExpanded ? 'translateX(0px)' : `translateX(-160px)`};
  ${mediaQuery.mediumAbove} {
    width: 180px;
    transform: ${(props) =>
      props.isExpanded ? 'translateX(0px)' : `translateX(-180px)`};
  }
`

const Index = styled.div`
  width: 100%;
  min-height: 16px;
  padding-left: 20px;
  padding-right: 20px;
  background-color: transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 400;
  word-wrap: break-word;
  color: #8e8e8e;

  &.isActive {
    color: ${ThemeColor.BLUE};
  }
`
const TOCBtn = '索引'.split('').map((c, i) => <p key={`toc-btn-${i}`}>{c}</p>)

export const tocAnchorPrefix = 'toc-anchor'
export const tocIndexPrefix = 'toc-index'
export type TOCIndex = { key: string; label: string }

export const TOC = (props: { indexes: TOCIndex[] }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <TOCContainer>
      <TOCTab
        onClick={() => {
          setIsExpanded(!isExpanded)
        }}
        isExpanded={isExpanded}
      >
        <div>{TOCBtn}</div>
      </TOCTab>
      <TOCBackground isExpanded={isExpanded}>
        {props.indexes?.map(
          (tocIndex, index) =>
            tocIndex && (
              <Index
                key={`toc-key-${index}`}
                id={`${tocIndexPrefix}-${tocIndex.key}`}
                onClick={() => {
                  const anchor = document.querySelector(
                    `#${tocAnchorPrefix}-${tocIndex.key}`
                  ) as HTMLElement
                  if (anchor) {
                    window.scrollTo({
                      top: anchor.offsetTop - STICKY_HEADER_HEIGHT,
                      behavior: 'smooth',
                    })
                  }
                }}
              >
                {tocIndex.label}
              </Index>
            )
        )}
      </TOCBackground>
    </TOCContainer>
  )
}
