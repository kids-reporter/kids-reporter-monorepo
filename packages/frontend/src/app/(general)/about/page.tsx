import { Metadata } from 'next'

import { GENERAL_DESCRIPTION } from '@/constants'
import AboutModule from '@/modules/about'
import { consultants, teamMembers } from '@/modules/about/constants'

export const metadata: Metadata = {
  title: '關於少年報導者 - 少年報導者 The Reporter for Kids',
  description: GENERAL_DESCRIPTION,
}

// ponytail: Next 15 segment config must be a literal. Non-prod used 0; this page
// has no fetched data, so a one-day revalidate matches prod until the next deploy.
export const revalidate = 86400

export default async function About() {
  return <AboutModule teamMembers={teamMembers} consultants={consultants} />
}
