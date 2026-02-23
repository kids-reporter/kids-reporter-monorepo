'use client'

import Image from 'next/image'

import { Author } from '@/components/author-card'
import { AuthorRole } from '@/constants'

import MemberCard from './team-member-card'

type TeamMemberAndConsultantProps = {
  teamMembers: Author[]
  consultants: Author[]
}

function TeamMemberAndConsultant({
  teamMembers,
  consultants,
}: TeamMemberAndConsultantProps) {
  return (
    <section className="mx-auto w-full max-w-300 pb-14 tablet:pb-16 desktop:pb-24 hd:pb-30">
      <div className="mx-auto flex w-full max-w-full flex-col gap-20 tablet:w-max tablet:gap-24 desktop:gap-32 hd:gap-28">
        <div
          id="team"
          className="mt-6 flex scroll-margin-anchor flex-col gap-6 tablet:mt-8 desktop:mt-8 desktop:gap-8 hd:my-6 hd:gap-10"
        >
          <div className="flex items-center gap-3 px-6 tablet:mx-auto tablet:px-8">
            <Image
              src="/assets/images/about/team-member-and-consultant/team_icon.svg"
              alt="Team icon"
              className="size-11"
              width={44}
              height={44}
            />
            <h2 className="prose-h2-small !font-swei text-neutral-900 desktop:prose-h2-large">
              我們的團隊
            </h2>
          </div>

          <div className="flex min-w-0 snap-x snap-mandatory scroll-px-6 gap-6 overflow-x-auto px-6 pb-2 scrollbar-none tablet:grid tablet:snap-none tablet:grid-cols-2 desktop:grid-cols-3 desktop:gap-8 hd:grid-cols-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="w-[248px] shrink-0 snap-start">
                <MemberCard
                  member={member}
                  isTeamMember={member.role !== AuthorRole.LITTLE_HELPER}
                />
              </div>
            ))}
          </div>
        </div>

        <div
          id="advisors"
          className="flex scroll-margin-anchor flex-col gap-6 desktop:gap-8 hd:gap-10"
        >
          <div className="flex items-center gap-3 px-6 tablet:mx-auto tablet:px-8">
            <Image
              src="/assets/images/about/team-member-and-consultant/consultant_icon.svg"
              alt="Consultant icon"
              className="h-11 w-11"
              width={44}
              height={44}
            />
            <h2 className="prose-h2-small !font-swei text-neutral-900 desktop:prose-h2-large">
              我們的顧問
            </h2>
          </div>

          <div className="flex min-w-0 snap-x snap-mandatory scroll-px-6 gap-6 overflow-x-auto px-6 pb-2 scrollbar-none tablet:grid tablet:snap-none tablet:grid-cols-2 desktop:grid-cols-3 desktop:gap-8 hd:grid-cols-4">
            {consultants.map((consultant) => (
              <div
                key={consultant.id}
                className="w-[248px] shrink-0 snap-start"
              >
                <MemberCard member={consultant} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TeamMemberAndConsultant
