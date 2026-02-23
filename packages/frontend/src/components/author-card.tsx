// TODO: remove this component when migrating to the new author card
import Link from 'next/link'

import { AuthorRole, DEFAULT_AVATAR, Theme } from '@/constants'

const getTheme = (group: AuthorRole) => {
  switch (group) {
    case AuthorRole.EDITORS:
    case AuthorRole.AUDITORS:
      return Theme.RED
    case AuthorRole.WRITERS:
    case AuthorRole.REVIEWERS:
    case AuthorRole.CONSULTANTS:
      return Theme.BLUE
    case AuthorRole.DESIGNERS:
    case AuthorRole.PHOTOGRAPHERS:
    default:
      return Theme.YELLOW
  }
}

export type Author = {
  id: string
  slug: string | undefined
  name: string
  avatar: string
  role: AuthorRole
  roleName?: string
  bio: string
}

type AuthorCardProp = {
  title: string
  authors: Author[]
}

export const AuthorCard = (props: AuthorCardProp) => {
  const authors = props?.authors

  return (
    authors?.length > 0 && (
      <div className="author-section">
        <h3 className="mt-10 mb-10 text-center text-3xl font-bold">
          {props.title}
        </h3>
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-stretch justify-evenly gap-10">
          {authors.map((author, index) => {
            const avatarURL = author.avatar ?? DEFAULT_AVATAR
            const theme = getTheme(author?.role)

            return (
              author && (
                <div
                  className="box-border flex w-80 flex-col items-center justify-center gap-0 rounded-3xl border-2 border-gray-200 bg-white px-9 pt-10"
                  key={`author-card-${index}`}
                >
                  <div className="mx-auto h-32 w-32 overflow-hidden rounded-full">
                    <img
                      className="max-w-full align-middle"
                      src={avatarURL}
                      alt={author.name}
                      loading="lazy"
                    />
                  </div>
                  <span
                    style={{ lineHeight: '160%', letterSpacing: '0.08em' }}
                    className="mt-3 text-center text-xl font-bold text-gray-900"
                  >
                    {author.name}
                  </span>
                  <div
                    style={{
                      flexFlow: 'row wrap',
                      columnGap: '12px',
                      lineHeight: '160%',
                      letterSpacing: '0.08em',
                      color: 'var(--theme-color, #27B5F7)',
                    }}
                    className={`my-4 flex rounded-3xl px-3 py-0.5 text-sm font-bold theme-${theme}`}
                  >
                    {author.roleName ? author.roleName : author.role}
                  </div>
                  <span
                    style={{
                      lineHeight: '160%',
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: '5',
                    }}
                    className="overflow-hidden text-base font-normal tracking-wider text-gray-900 not-italic"
                  >
                    {author.bio}
                  </span>
                  {author.slug && (
                    <div className="mt-5 mb-10 text-center text-lg">
                      <Link
                        href={`/author/${author.slug}`}
                        style={{ color: 'var(--theme-color)' }}
                        className={`no-underline theme-${theme}`}
                      >
                        <span>
                          了解更多{' '}
                          <i
                            style={{ color: 'var(--theme-color)' }}
                            className="icon-rpjr-icon-arrow-right"
                          />
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
              )
            )
          })}
        </div>
        {/* TODO: more button <button
          className="author-section__m-btn rpjr-btn"
          //onclick="document.querySelector('.author-section').classList.add('author-section--show')"
        >
          展開看所有作者
        </button>*/}
      </div>
    )
  )
}

export default AuthorCard
