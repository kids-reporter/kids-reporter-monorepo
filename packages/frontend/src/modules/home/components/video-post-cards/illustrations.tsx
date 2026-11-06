import { cn } from '@kids-reporter/routing-ui'
import Image from 'next/image'

function VideoPostCardsIllustrations() {
  return (
    <div className={cn('absolute top-0 left-0 z-1 hd:left-[calc(50vw-650px)]')}>
      <Image
        src="/assets/images/home/category/video_illustration_s.svg"
        alt="影片 illustration"
        width={160}
        height={160}
        className="h-40 w-40 tablet:hidden"
      />
      <Image
        src="/assets/images/home/category/video_illustration_m.svg"
        alt="影片 illustration"
        width={176}
        height={176}
        className="hidden h-48 w-48 tablet:block desktop:hidden"
      />
      <Image
        src="/assets/images/home/category/video_illustration_l.svg"
        alt="影片 illustration"
        width={240}
        height={240}
        className="hidden h-60 w-60 desktop:block hd:hidden"
      />
      <Image
        src="/assets/images/home/category/video_illustration_xl.svg"
        alt="影片 illustration"
        width={240}
        height={240}
        className="hidden h-60 w-60 hd:block"
      />
    </div>
  )
}

export default VideoPostCardsIllustrations
