import { Metadata } from 'next'

import { GENERAL_DESCRIPTION } from '@/constants'
import envVars from '@/environment-variables'
import AboutModule from '@/modules/about'
import { consultants, teamMembers } from '@/modules/about/constants'

export const metadata: Metadata = {
  title: '關於少年報導者 - 少年報導者 The Reporter for Kids',
  description: GENERAL_DESCRIPTION,
}

export const revalidate = envVars.isProduction ? 86400 : 0 // 1 day

export default async function About() {
  return <AboutModule teamMembers={teamMembers} consultants={consultants} />
}
