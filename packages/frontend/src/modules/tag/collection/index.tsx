import CommonCollection from '@/components/common-collection'
import type { PostSummary } from '@/components/types'

type TagCollectionModuleProps = {
  tagName: string
  posts: PostSummary[]
  totalPages: number
  currentPage: number
  routingPrefix: string
}

export default function TagCollectionModule({
  tagName,
  posts,
  totalPages,
  currentPage,
  routingPrefix,
}: TagCollectionModuleProps) {
  return (
    <main>
      <CommonCollection
        hero={{
          type: 'customized',
          content: (
            <div className="flex h-[260px] w-full items-start justify-center desktop:h-[320px] hd:mb-10">
              <h1 className="mt-20 px-6 text-center prose-h1-small font-swei! text-neutral-900 desktop:mt-24 desktop:prose-h1-large">
                {`#${tagName}`}
              </h1>
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
