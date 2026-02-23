'use client'

import { cn } from '@kids-reporter/routing-ui'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'

import { useAuthorAvatarQuery } from '@/api-utils/react-query/hooks/author-avatar'
import type { Author } from '@/components/author-card'
import { DEFAULT_AVATAR } from '@/constants'
import useClickOutside from '@/hooks/use-click-outside'
import { ArrowRight } from '@/icons/arrow'

type MemberCardProps = {
  member: Author
  isTeamMember?: boolean
}

const cardBaseClass =
  'group relative block h-[270px] w-[248px] overflow-hidden rounded-[20px] border-2 border-neutral-200 bg-neutral-white p-6'

function MemberCard({ member, isTeamMember = false }: MemberCardProps) {
  const { data: fetchedAvatar } = useAuthorAvatarQuery({
    slug: member.slug,
    avatar: member.avatar,
  })

  const avatarURL = member.avatar || fetchedAvatar || DEFAULT_AVATAR
  const roleText = member.roleName ?? member.role
  const href = member.slug ? `/author/${member.slug}` : '#'
  const [isClicked, setIsClicked] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const handleClick = () => {
    setIsClicked((prev) => !prev)
  }

  useClickOutside(ref, () => setIsClicked(false))

  const frontFace = (
    <div className="flex h-full flex-col items-center justify-center gap-5">
      <div className="h-30 w-30">
        <Image
          className="h-full w-full object-cover"
          src={avatarURL}
          alt={member.name}
          width={120}
          height={120}
          loading="lazy"
        />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-center prose-h6-large font-bold text-neutral-900">
          {member.name}
        </span>
        <span className="text-center prose-p2-bold text-neutral-700">
          {roleText}
        </span>
      </div>
    </div>
  )

  const backFaceBio = (
    <div className="flex flex-1 flex-col gap-1">
      <span className="prose-p1-bold text-neutral-900">
        {member.name}｜{roleText}
      </span>
      <p className="line-clamp-6 text-justify prose-p2 text-neutral-900">
        {member.bio}
      </p>
    </div>
  )

  const backFaceArrow = isTeamMember ? (
    <div className="flex justify-end">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-white hover:bg-red-500 hover:text-neutral-white">
        <ArrowRight />
      </div>
    </div>
  ) : null

  return (
    <>
      {/* Mobile/Tablet: flip on click — whole card flips */}
      <div
        ref={ref}
        onClick={handleClick}
        className="block h-[270px] w-[248px] cursor-pointer perspective-[1000px] desktop:hidden"
      >
        <div
          className={cn(
            'relative h-full w-full transition-transform duration-500 transform-3d',
            isClicked && 'transform-[rotateY(180deg)]'
          )}
        >
          <div className="absolute inset-0 flex transform-[rotateY(0deg)] flex-col items-center justify-center gap-5 rounded-[20px] border-2 border-neutral-200 bg-neutral-white p-6 backface-hidden">
            {frontFace}
          </div>
          <div className="absolute inset-0 flex h-full transform-[rotateY(180deg)] flex-col gap-4 rounded-[20px] border-2 border-neutral-200 bg-neutral-300 p-6 backface-hidden">
            {backFaceBio}
            {isTeamMember && (
              <div
                className="flex justify-end"
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  href={href}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-white transition-colors duration-200 hover:bg-red-500 hover:text-neutral-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ArrowRight />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop/HD: hover effect */}
      {isTeamMember ? (
        <Link
          href={href}
          aria-disabled={false}
          tabIndex={0}
          className={cn(cardBaseClass, 'hidden desktop:block')}
        >
          <div className="flex h-full flex-col items-center justify-center gap-5 transition-opacity group-hover:opacity-0">
            {frontFace}
          </div>
          <div className="absolute inset-0 z-10 flex h-full flex-col gap-4 bg-neutral-300 p-6 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100">
            {backFaceBio}
            {backFaceArrow}
          </div>
        </Link>
      ) : (
        <div className={cn(cardBaseClass, 'hidden desktop:block')}>
          <div className="flex h-full flex-col items-center justify-center gap-5">
            {frontFace}
          </div>
          <div className="absolute inset-0 z-10 flex h-full flex-col gap-4 bg-neutral-300 p-6 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100">
            {backFaceBio}
            {backFaceArrow}
          </div>
        </div>
      )}
    </>
  )
}

export default MemberCard
