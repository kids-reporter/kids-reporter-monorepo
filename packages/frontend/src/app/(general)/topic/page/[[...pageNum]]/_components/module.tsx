// TODO: move this to modules
'use client'

import AllSiteBaodaozaiEventTrigger from '@/components/all-site-baodaozai-event-trigger'
import useAllSiteBaodaozaiIdleTimer from '@/hooks/use-site-baodaozai-idle-timer'

function TopicModule({ introContent }: { introContent: string }) {
  const { isIdle: isAllSiteBaodaozaiIdle } = useAllSiteBaodaozaiIdleTimer()
  return (
    <>
      <AllSiteBaodaozaiEventTrigger
        id="show-intro"
        content={introContent}
        isIdle={isAllSiteBaodaozaiIdle}
      />
      <div className="relative">
        <div className="absolute top-[150vh]">
          <AllSiteBaodaozaiEventTrigger
            id="hide-intro"
            isIdle={isAllSiteBaodaozaiIdle}
            content={introContent}
          />
        </div>
      </div>
    </>
  )
}

export default TopicModule
