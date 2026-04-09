import Image from 'next/image'

import CommonCollection from '@/components/common-collection'
import type { PostSummary } from '@/components/types'

type AuthorCollectionModuleProps = {
  author: {
    name: string
    bio?: string | null
    email?: string | null
    avatarURL: string
  }
  posts: PostSummary[]
  totalPages: number
  currentPage: number
  routingPrefix: string
}

export default function AuthorCollectionModule({
  author,
  posts,
  totalPages,
  currentPage,
  routingPrefix,
}: AuthorCollectionModuleProps) {
  return (
    <main>
      <CommonCollection
        hero={{
          type: 'customized',
          content: (
            <div className="flex w-full flex-col items-center px-6 pt-12 pb-17 tablet:px-8 tablet:pt-16 tablet:pb-40 desktop:px-12 desktop:pt-20 desktop:pb-45 hd:px-0">
              <div className="flex w-full flex-col items-center gap-6 text-center tablet:max-w-[582px] tablet:flex-row tablet:items-start tablet:gap-12 tablet:text-left desktop:max-w-[608px] hd:max-w-[790px]">
                <div className="relative h-[120px] w-[120px] shrink-0 overflow-hidden tablet:h-[160px] tablet:w-[160px]">
                  <Image
                    src={author.avatarURL}
                    alt={author.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 120px, 160px"
                  />
                </div>
                <div className="flex w-full flex-col gap-4">
                  <div className="flex w-full flex-col gap-1">
                    <h1 className="prose-h5-small text-neutral-900 desktop:prose-h5-large">
                      {author.name}
                    </h1>
                    {author.email != null && author.email !== '' && (
                      <a
                        href={`mailto:${author.email}`}
                        className="prose-p2 text-blue-400 underline decoration-neutral-400 underline-offset-2 desktop:prose-p1"
                      >
                        {author.email}
                      </a>
                    )}
                  </div>
                  {author.bio != null && author.bio !== '' && (
                    <p className="prose-p2 whitespace-pre-wrap text-neutral-900 desktop:prose-p1">
                      {author.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ),
        }}
        morePostsMode="pagination"
        totalPages={totalPages}
        currentPage={currentPage}
        routingPrefix={routingPrefix}
        posts={posts}
      />
    </main>
  )
}
