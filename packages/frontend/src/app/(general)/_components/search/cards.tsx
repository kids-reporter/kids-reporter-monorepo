'use client'
import { createRef } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import styled from 'styled-components'

import { mediaQuery } from '@/utils/media-query'

import Card, { CardProp } from './card'

// @ts-ignore - styled-components is not typed
const FlexContainer = styled(TransitionGroup)`
  display: flex;
  flex-direction: column;
  // Avoid grid cell overflow parent, ref: https://datacadamia.com/web/css/grid/overflow#overflow_example
  & > * {
    min-width: 0;
  }

  gap: 40px;
  margin: 24px 0px 32px 0px;

  ${mediaQuery.mediumAbove} {
    gap: 32px;
    margin: 40px 0px 48px 0px;
  }

  ${mediaQuery.largeOnly} {
    gap: 44px;
    margin: 48px 0px 64px 0px;
    max-width: var(--normal-container-max-width);
  }

  .item-enter {
    opacity: 0;
  }
  .item-enter-done {
    opacity: 1;
    transition: opacity 500ms ease-in;
  }
`

export type { CardProp }

const Cards = ({ items }: { items: CardProp[] }) => {
  const cardsJsx = items.map((item, idx) => {
    const nodeRef = createRef<HTMLDivElement>()
    if (!item) {
      return null
    }
    return (
      <CSSTransition
        in={true}
        key={idx}
        nodeRef={nodeRef}
        timeout={500}
        classNames="item"
      >
        <div ref={nodeRef}>
          <Card content={item.content} />
        </div>
      </CSSTransition>
    )
  })
  return <FlexContainer>{cardsJsx}</FlexContainer>
}

export { Cards }
export default Cards
