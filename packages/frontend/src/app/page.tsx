import { Header } from '@kids-reporter/routing-ui'
import { Metadata } from 'next'

import { getCallBaodaozaiIntroContent } from '@/api/call-baodaozai-intro'
import { getEditorPicksSettings } from '@/api/editor-picks-settings'
import { getLatestPosts } from '@/api/post'
import { getTopicProjects } from '@/api/project'
import AuthHeaderLoggedInSetter from '@/components/auth-header-logged-in-setter'
import ScrollUpBaodaozaiEventTrigger from '@/components/scroll-up-baodaozai-event-trigger'
import { FALLBACK_IMG, GENERAL_DESCRIPTION } from '@/constants'
import HomeModule from '@/modules/home'
import {
  Baodaozai,
  BaodaozaiVisibilitySetter,
  CallBaodaozaiProvider,
} from '@/services/call-baodaozai'
import { getPostSummaries } from '@/utils'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '少年報導者 The Reporter for Kids - 理解世界 參與未來',
  description: GENERAL_DESCRIPTION,
}

export default async function Home() {
  const serverRenderTime = new Date().toISOString()
  console.log('Server re-render at:', serverRenderTime)

  const [
    topicProjectsRes,
    latestPostsDataRes,
    editorPicksSettingsRes,
    introContentRes,
  ] = await Promise.allSettled([
    getTopicProjects({
      orderBy: [{ publishedDate: 'desc' }],
      take: 9,
    }),
    getLatestPosts({
      orderBy: [{ publishedDate: 'desc' }],
      take: 6,
    }),
    getEditorPicksSettings({
      take: 5,
    }),
    getCallBaodaozaiIntroContent({ where: { page: 'home' } }),
  ])

  const topicProjects =
    topicProjectsRes.status === 'fulfilled' ? topicProjectsRes.value : []
  const latestPostsData =
    latestPostsDataRes.status === 'fulfilled' ? latestPostsDataRes.value : []
  const editorPicksSettings =
    editorPicksSettingsRes.status === 'fulfilled'
      ? editorPicksSettingsRes.value
      : []
  const introContent =
    introContentRes.status === 'fulfilled' ? introContentRes.value : undefined

  const topics =
    topicProjects?.map((project) => {
      return {
        url: `/topic/${project.slug}`,
        image: project.heroImage?.resized?.small ?? FALLBACK_IMG,
        title: project.title ?? '',
        subtitle: project.subtitle ?? '',
      }
    }) ?? []

  const latestPosts = getPostSummaries(latestPostsData ?? [])

  const firstEditorPicksSettings = editorPicksSettings?.[0]

  const featuredPosts =
    getPostSummaries(
      firstEditorPicksSettings?.editorPicksOfPostsOrdered ?? []
    ) ?? []

  return (
    <CallBaodaozaiProvider>
      <main className="flex w-screen flex-col items-center">
        <Header />
        <BaodaozaiVisibilitySetter show={true} />
        <AuthHeaderLoggedInSetter />

        <HomeModule
          topics={topics}
          latestPosts={latestPosts}
          featuredPosts={featuredPosts}
          introContent={introContent ?? ''}
        />
        <Baodaozai />
        <ScrollUpBaodaozaiEventTrigger />
      </main>
    </CallBaodaozaiProvider>
  )
}
