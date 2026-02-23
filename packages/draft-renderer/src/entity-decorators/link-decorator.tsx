import { ContentState } from 'draft-js'
import React from 'react'
import styled, { ThemeProvider } from 'styled-components'

import { ENTITY, findEntitiesByType } from '../utils/entity'

const LinkWrapper = styled.a`
  text-decoration: underline;
  color: #27b3f5;
  transition: text-decoration-color 0.1s ease-in;
  cursor: pointer;
  text-decoration-color: #c6c6c6;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;

  &:hover {
    text-decoration-color: #27b3f5;
  }

  & > span {
    color: #27b3f5 !important;
    text-decoration: underline !important;
    text-decoration-color: #c6c6c6 !important;
    text-underline-offset: 3px !important;
    text-decoration-thickness: 1px !important;
    transition: text-decoration-color 0.1s ease-in !important;

    &:hover {
      text-decoration-color: #27b3f5 !important;
    }
  }
`

const LinkInner = (props: {
  contentState: ContentState
  entityKey: string
  children: React.ReactNode
}) => {
  const { url } = props.contentState.getEntity(props.entityKey).getData()

  // Handling for internal/external links, internal links start with '#'
  const linkProps = url.match(/^#/)
    ? {
        onClick: () => {
          const anchor = document.querySelector(url) as HTMLElement
          const elementPosition = anchor.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.scrollY - 64
          if (anchor) {
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth',
            })
          }
        },
      }
    : {
        href: url,
        target: '_blank',
      }

  return <LinkWrapper {...linkProps}>{props.children}</LinkWrapper>
}

const Link = (props: {
  contentState: ContentState
  entityKey: string
  children: React.ReactNode
}) => {
  return (
    <ThemeProvider theme={{}}>
      <LinkInner {...props} />
    </ThemeProvider>
  )
}

export const linkDecorator = {
  strategy: findEntitiesByType(ENTITY.Link),
  component: Link,
}
