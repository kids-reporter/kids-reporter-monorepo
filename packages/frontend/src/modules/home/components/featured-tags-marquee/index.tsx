import Link from 'next/link'
import Marquee from 'react-fast-marquee'

import { Tag } from '../../types'
import Illustrations from './illustrations'

type FeaturedTagsMarqueeProps = {
  tags: Tag[]
}

function FeaturedTagsMarquee({ tags }: FeaturedTagsMarqueeProps) {
  return (
    <div className="mt-4 w-screen tablet:mt-6 desktop:mt-8 hd:mt-10">
      {tags.length > 0 && (
        <Marquee pauseOnHover pauseOnClick autoFill className="pb-4">
          {tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/tag/${tag.slug}`}
              className="px-4 py-4 prose-h3-small font-normal! text-neutral-900 hover:text-red-400 hover:underline desktop:px-5 desktop:prose-h2-small desktop:font-normal!"
            >
              #{tag.name}
            </Link>
          ))}
        </Marquee>
      )}
      <Illustrations />
    </div>
  )
}

export default FeaturedTagsMarquee
