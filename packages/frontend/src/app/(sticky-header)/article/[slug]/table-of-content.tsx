'use client'
import { useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { mediaQuery } from '@/app/utils/media-query'

const TOCContainer = styled.div`
  position: fixed;
  width: 90px;
  left: 0;
  transform: translateY(-50%);

  ${mediaQuery.mediumAbove} {
  }

  ${mediaQuery.smallOnly} {
  }
`

const zIndex = 100
const tocWidth = 180 // px
const TOCTab = styled.div`
  width: 30px;
  position: fixed;
  z-index: ${zIndex};
  top: 150px;
  left: 0;
  transition: transform 0.1s ease-in-out 0.1s;
  transform: ${(props) =>
    props.isExpanded ? `translateX(${tocWidth}px)` : 'translateX(0px)'};
  cursor: pointer;

  > div {
    opacity: 0.6;
    color: black;
    background-color: #f4f4f4;
    font-size: 14px;
    width: 14px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`
const TOCBackground = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  z-index: ${zIndex};
  top: 220;
  left: 0;
  height: 100vh;
  width: ${tocWidth}px;
  background-color: #f4f4f4;
  transition: transform 0.1s ease-in-out 0.1s;
  transform: ${(props) =>
    props.isExpanded ? 'translateX(0px)' : `translateX(-${tocWidth}px)`};
`

export const TableOfContent = ({ post }: { post: any }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const entityMap = post?.content?.entityMap
  const tocs: { id: string; label: string }[] = []
  Object.keys(entityMap)?.forEach((key) => {
    // TODO: replace LINK with TOC
    if (entityMap[key]?.type === 'LINK') {
      tocs.push({
        id: `table-of-content-${key}`,
        label: entityMap[key].data?.url ?? '',
      })
    }
  })

  return (
    <TOCContainer>
      <TOCTab
        onClick={() => {
          setIsExpanded(!isExpanded)
        }}
        isExpanded={isExpanded}
      >
        <div>索引</div>
      </TOCTab>
      <TOCBackground isExpanded={isExpanded}>
        {tocs.map(
          (toc, index) =>
            toc && (
              <Link key={`toc-key-${index}`} href="#" id={'111'}>
                {toc.label}
                <br />
              </Link>
            )
        )}
      </TOCBackground>
    </TOCContainer>
  )
}

export default TableOfContent
