'use client'

import SupportAction from '@/components/support-action'
import { TableOfContentSideMenu } from '@/components/table-of-content'
import { FeatureIntroDialogProvider } from '@/services/feature-intro'
import FeatureIntroDialog from '@/services/feature-intro/components/feature-info-dialog'

import Awards from './components/awards'
import CrossBorderCollaboration from './components/cross-border-collaboration'
import DiscoverNews from './components/discover-news'
import Intro from './components/intro'
import JoinUs from './components/join-us'
import ReaderRecommendations from './components/reader-recommendations'
import RelatedProducts from './components/related-products'
import SupportActionContent from './components/support-action-content'
import TeamMemberAndConsultant from './components/team-member-and-consultant'
import { ABOUT_TOC_INDEXES } from './constants'
import { Author } from './types'

type AboutModuleProps = {
  teamMembers: Author[]
  consultants: Author[]
}

function AboutModule({ teamMembers, consultants }: AboutModuleProps) {
  return (
    <FeatureIntroDialogProvider>
      <main className="flex w-full flex-col items-center justify-center overflow-x-hidden">
        <TableOfContentSideMenu
          indexes={ABOUT_TOC_INDEXES}
          anchorIdPrefix=""
          ariaLabel="關於我們目錄"
        />
        <Intro />
        <DiscoverNews />
        <div className="w-screen bg-yellow-100">
          <RelatedProducts />
          <CrossBorderCollaboration />
        </div>
        <ReaderRecommendations />
        <JoinUs />
        <TeamMemberAndConsultant
          teamMembers={teamMembers}
          consultants={consultants}
        />
        <div className="w-screen bg-yellow-100">
          <Awards />
        </div>
        <SupportAction
          title={
            <>
              為孩子製作好新聞
              <br />
              前所未有的重要
            </>
          }
          content={<SupportActionContent />}
          className="bg-yellow-200"
          id="support"
        />
      </main>
      <FeatureIntroDialog />
    </FeatureIntroDialogProvider>
  )
}

export default AboutModule
