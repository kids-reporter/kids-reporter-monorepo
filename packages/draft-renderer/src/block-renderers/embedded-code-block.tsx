import { useEffect, useRef } from 'react'
import styled from 'styled-components'

import { mediaQuery } from '../utils/media-query'

export const Block = styled.div`
  position: relative;
  white-space: normal;
  /* styles for image link */
  img.img-responsive {
    margin: 0 auto;
    max-width: 100%;
    height: auto;
    display: block;
  }
`

export const Caption = styled.p`
  padding: 10px 0 0 0;
  margin-top: 5px;
  text-align: center;
  color: var(--paletteColor3, #808080);
`

type EmbeddedCodeBlockProps = {
  className?: string
  data: {
    caption?: string
    align?: string
    embeddedCode: string
  }
}

export const EmbeddedCodeBlock = ({
  className,
  data,
}: EmbeddedCodeBlockProps) => {
  const { caption, embeddedCode } = data
  const embedded = useRef(null)

  useEffect(() => {
    if (!embedded.current) return
    const node: HTMLElement = embedded.current

    const fragment = document.createDocumentFragment()

    // `embeddedCode` is a string, which may includes
    // multiple '<script>' tags and other html tags.
    // For executing '<script>' tags on the browser,
    // we need to extract '<script>' tags from `embeddedCode` string first.
    //
    // The approach we have here is to parse html string into elements,
    // and we could use DOM element built-in functions,
    // such as `querySelectorAll` method, to query '<script>' elements,
    // and other non '<script>' elements.
    const parser = new DOMParser()
    const ele = parser.parseFromString(
      `<div id="draft-embed">${embeddedCode}</div>`,
      'text/html'
    )
    const scripts = ele.querySelectorAll('script')
    const nonScripts = ele.querySelectorAll('div#draft-embed > :not(script)')

    nonScripts.forEach((ele) => {
      fragment.appendChild(ele)
    })

    scripts.forEach((s) => {
      const scriptEle = document.createElement('script')
      const attrs = s.attributes
      for (let i = 0; i < attrs.length; i++) {
        scriptEle.setAttribute(attrs[i].name, attrs[i].value)
      }
      scriptEle.text = s.text || ''
      fragment.appendChild(scriptEle)
    })

    node.appendChild(fragment)
  }, [embeddedCode])

  return (
    <div className={className}>
      {
        // WORKAROUND:
        // The following `<input>` is to solve [issue 153](https://github.com/mirror-media/openwarehouse-k6/issues/153).
        // If the emebed code generates `<input>` or `<textarea>` and appends them onto DOM,
        // and then the generated `<input>` or `<textarea>` will hijack the users' cursors.
        // It will cause that users could not edit the DraftJS Editor anymore.
        // The following phony `<input>` is used to prevent the generated `<input>` or `<textare>` from
        // hijacking the users' cursors.
      }
      <input hidden disabled />
      <Block ref={embedded} />
      {caption && <Caption>{caption}</Caption>}
    </div>
  )
}

const ArticleBodyContainer = styled.div<{ $align?: string }>`
  max-width: ${(props) => (props.$align === 'image-width' ? '1000' : '700')}px;
  margin: 0 auto 60px auto;

  ${mediaQuery.smallOnly} {
    width: 100%;
    margin: 0 auto;
    max-width: min(512px, 100vw - 48px);
    margin-bottom: 40px;
  }

  ${mediaQuery.mediumAbove} {
    max-width: ${(props) =>
      props.$align === 'image-width' ? '1000' : '584'}px;
  }

  ${mediaQuery.desktopAbove} {
    max-width: ${(props) =>
      props.$align === 'image-width' ? '1000' : '608'}px;
  }

  ${mediaQuery.largeOnly} {
    max-width: ${(props) =>
      props.$align === 'image-width' ? '1000' : '680'}px;
  }
`

export function EmbeddedCodeInArticleBody({
  className = '',
  data,
}: EmbeddedCodeBlockProps) {
  return (
    <ArticleBodyContainer $align={data.align} className={className}>
      <EmbeddedCodeBlock data={data} />
    </ArticleBodyContainer>
  )
}
