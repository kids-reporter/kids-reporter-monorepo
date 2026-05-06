import { HeaderPostTitleSetter } from '@kids-reporter/routing-ui'
import { RawDraftContentState } from 'draft-js'

import { PostSummary } from '@/components/types'
import { SeparateIcon } from '@/icons'
import { Photo } from '@/types'

import HeroTitle from '../components/hero-title'
import RelatedPosts from '../components/related-posts'
import TopicContentWithMask from '../components/topic-content-with-mask'
import TopicRenderer from '../components/topic-renderer'
import { TitlePosition } from '../types'

type TopicSlugModuleProps = {
  title: string
  subtitle: string
  titlePosition: TitlePosition
  backgroundImage: Photo
  mobileBgImage?: Photo
  publishedDate: string
  content?: RawDraftContentState
  credits?: RawDraftContentState
  relatedPosts: PostSummary[]
}

function TopicSlugModule({
  title,
  subtitle,
  titlePosition,
  backgroundImage,
  mobileBgImage,
  publishedDate,
  content,
  credits,
  relatedPosts,
}: TopicSlugModuleProps) {
  return (
    <div className="w-full">
      <HeaderPostTitleSetter postTitle={title} />
      <HeroTitle
        title={title}
        subtitle={subtitle}
        titlePosition={titlePosition}
        backgroundImage={backgroundImage}
        mobileBgImage={mobileBgImage}
        publishedDate={publishedDate}
        articleCount={relatedPosts.length}
      />
      <div className="my-10 tablet:my-16 desktop:my-20">
        <TopicContentWithMask rawContentState={content} />
        <div className="my-6 tablet:my-10 [&>svg]:mx-auto">
          <SeparateIcon />
        </div>
        <div className="text-center">
          <TopicRenderer
            rawContentState={credits}
            className="prose-p2 leading-[30px]"
          />
        </div>
      </div>

      <RelatedPosts posts={relatedPosts} />
    </div>
  )
}

export default TopicSlugModule
