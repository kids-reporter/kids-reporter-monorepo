import {
  convertFromRaw,
  Editor,
  EditorState,
  RawDraftContentState,
} from 'draft-js'
import { useEffect } from 'react'
import { ThemeProvider } from 'styled-components'

import blockRenderMaps from './block-render-maps/index'
import { atomicBlockRenderer } from './block-renderer-fn'
import { customStyleFn } from './custom-style-fn'
import { decorator } from './entity-decorators'
import { ThemeColorEnum } from './utils/index'

const blockRendererFn = (block: any) => {
  const atomicBlockObj = atomicBlockRenderer(block)
  return atomicBlockObj
}

export enum FontSizeLevel {
  NORMAL = 'normal',
  LARGE = 'large',
}

type DraftRendererProps = {
  themeColor: ThemeColorEnum
  fontSizeLevel: FontSizeLevel
  onImageModalOpen?: (
    imgProps: React.ImgHTMLAttributes<HTMLImageElement>
  ) => void
  rawContentState: RawDraftContentState
  initiallyScrollTo?: string
  offsetTop?: number
}

const DraftRenderer = ({
  rawContentState,
  themeColor = ThemeColorEnum.RED,
  fontSizeLevel = FontSizeLevel.NORMAL,
  onImageModalOpen = undefined,
  initiallyScrollTo = '',
  offsetTop = 0,
}: DraftRendererProps) => {
  const contentState = convertFromRaw(rawContentState)
  const editorState = EditorState.createWithContent(contentState, decorator)

  const scrollToElement = (hash: string) => {
    const anchor = document.querySelector(hash) as HTMLElement
    anchor &&
      window.scrollTo({
        top: anchor.offsetTop - offsetTop,
        behavior: 'auto',
      })
  }

  useEffect(() => {
    initiallyScrollTo && scrollToElement(initiallyScrollTo)
  }, [])

  return (
    <ThemeProvider
      theme={{
        themeColor,
        fontSizeLevel,
        offsetTop,
        onImageModalOpen,
      }}
    >
      <Editor
        editorState={editorState}
        blockRenderMap={blockRenderMaps.content}
        blockRendererFn={blockRendererFn}
        customStyleFn={customStyleFn}
        readOnly
        onChange={() => {}}
      />
    </ThemeProvider>
  )
}

const ArticleBodyDraftRenderer = DraftRenderer

const ArticleIntroductionDraftRenderer = ({
  rawContentState,
  themeColor = ThemeColorEnum.RED,
  fontSizeLevel = FontSizeLevel.NORMAL,
}: DraftRendererProps) => {
  const contentState = convertFromRaw(rawContentState)
  const editorState = EditorState.createWithContent(contentState, decorator)

  return (
    <ThemeProvider
      theme={{
        themeColor,
        fontSizeLevel,
      }}
    >
      <Editor
        editorState={editorState}
        blockRenderMap={blockRenderMaps.brief}
        customStyleFn={customStyleFn}
        readOnly
        onChange={() => {}}
      />
    </ThemeProvider>
  )
}

const ProjectContentDraftRenderer = ({
  rawContentState,
  themeColor = ThemeColorEnum.BLUE,
  fontSizeLevel = FontSizeLevel.NORMAL,
}: DraftRendererProps) => {
  const contentState = convertFromRaw(rawContentState)
  const editorState = EditorState.createWithContent(contentState, decorator)

  return (
    <ThemeProvider
      theme={{
        themeColor,
        fontSizeLevel,
      }}
    >
      <Editor
        editorState={editorState}
        blockRenderMap={blockRenderMaps.projectContent}
        blockRendererFn={blockRendererFn}
        customStyleFn={customStyleFn}
        readOnly
        onChange={() => {}}
      />
    </ThemeProvider>
  )
}

export {
  ArticleBodyDraftRenderer,
  ArticleIntroductionDraftRenderer,
  DraftRenderer,
  ProjectContentDraftRenderer,
}
