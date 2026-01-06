import { ContentState } from 'draft-js'
import React from 'react'
import styled, { ThemeProvider, useTheme } from 'styled-components'

import { ENTITY, findEntitiesByType } from '../utils/entity'

const LinkWrapper = styled.a`
  text-decoration: underline;
  color: #27b3f5;
  transition: color 0.1s ease-in;
  cursor: pointer;

  &:hover {
    color: #232323;
  }
`

const LinkInner = (props: {
  contentState: ContentState
  entityKey: string
  children: React.ReactNode
}) => {
  const { url } = props.contentState.getEntity(props.entityKey).getData()
  const theme = useTheme()

  // Handling for internal/external links, internal links start with '#'
  const linkProps = url.match(/^#/)
    ? {
        onClick: () => {
          const anchor = document.querySelector(url) as HTMLElement
          if (anchor) {
            window.scrollTo({
              top: anchor.offsetTop - (theme as any)?.offsetTop,
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
