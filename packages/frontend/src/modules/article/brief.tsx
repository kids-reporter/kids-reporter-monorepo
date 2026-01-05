'use client'
import 'react-loading-skeleton/dist/skeleton.css'

import { ArticleIntroductionDraftRenderer } from '@kids-reporter/draft-renderer'
import { RawDraftContentState } from 'draft-js'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Skeleton from 'react-loading-skeleton'

import { Theme } from '@/constants'

import { useArticleContext } from './context'

const textColor = '#575757'

export type AuthorGroup = {
  title: string
  authors: {
    name: string
    link: string
  }[]
}

type AuthorsProp = {
  authorGroups: AuthorGroup[]
}

const Authors = (props: AuthorsProp) => {
  return (
    <p style={{ lineHeight: '150%', color: textColor }} className="text-center">
      <span className="text-sm">
        {'('}
        {props?.authorGroups?.map((authorGroup, authorGroupIndex) => {
          return (
            <span key={`brief-author-group-${authorGroupIndex}`}>
              {`${authorGroup.title}／`}
              {authorGroup?.authors?.map((author, index) => {
                return (
                  <span key={`brief-author-${index}`}>
                    {author.link ? (
                      <Link
                        className="underline decoration-1"
                        href={author.link}
                        target="_blank"
                        rel="noopener"
                      >
                        {author.name}
                      </Link>
                    ) : (
                      <span>{author.name}</span>
                    )}
                    {index + 1 < authorGroup.authors.length ? '、' : ''}
                  </span>
                )
              })}
              {authorGroupIndex + 1 < props.authorGroups.length ? `；` : ''}
            </span>
          )
        })}
        {')'}
      </span>
    </p>
  )
}

type BriefProp = {
  content: RawDraftContentState
  theme: Theme
  authors: AuthorGroup[]
}

export const Brief = (props: BriefProp) => {
  const content = props?.content
  const authors = props?.authors
  const [isMounted, setIsMounted] = useState(false)
  const { fontSize } = useArticleContext()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="post-intro">
      {isMounted && content ? (
        <>
          <ArticleIntroductionDraftRenderer
            rawContentState={content}
            themeColor={props.theme}
            fontSizeLevel={fontSize}
          />
          {authors?.length > 0 && <Authors authorGroups={authors} />}
        </>
      ) : (
        <Skeleton width={'100%'} count={5} />
      )}
    </div>
  )
}

export default Brief
