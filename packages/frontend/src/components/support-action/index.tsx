'use client'

import { Button, cn } from '@kids-reporter/routing-ui'
import Link from 'next/link'

import { DONATE_URL } from '@/constants'

import TriangleIllustrations from './triangle-illustrations'

type SupportActionProps = {
  title: React.ReactNode
  content: React.ReactNode
  className?: string
  id?: string
}

function SupportAction({ title, content, className, id }: SupportActionProps) {
  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-screen overflow-hidden bg-yellow-100',
        className
      )}
      id={id}
    >
      <div className="relative w-full">
        <TriangleIllustrations />

        <div className="relative z-10 flex flex-col items-center justify-center px-14 py-14 tablet:px-12 desktop:px-16 desktop:py-16">
          <div className="flex w-full max-w-[510px] flex-col hd:max-w-[584px]">
            <div className="flex flex-col gap-4">
              <h3 className="text-center prose-h3-small !font-swei text-neutral-900 desktop:prose-h3-large">
                {title}
              </h3>
              <p className="prose-p1 text-neutral-900">{content}</p>
            </div>
            <Button
              variant="primary"
              size={44}
              asChild
              className="mx-auto mt-8 w-[115px]"
            >
              <Link href={DONATE_URL} target="_blank" rel="noopener noreferrer">
                前往贊助
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupportAction
