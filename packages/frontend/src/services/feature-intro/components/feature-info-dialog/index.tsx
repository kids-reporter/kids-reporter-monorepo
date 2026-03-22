'use client'

import { Button, cn, useMediaQuery } from '@kids-reporter/routing-ui'
import Image from 'next/image'
import { useEffect, useState } from 'react'

import { Dialog, DialogContent, DialogTitle } from '@/components/dialog'
import { CheckCircleIcon } from '@/icons'

import featureIntroConfig from '../../config'
import { FEATURE_INTRO_DIALOG_SEEN_KEY } from '../../constants'
import { useFeatureIntroDialogContext } from '../../context'
import { renderDescription } from '../../utils'
import IndicatorDots from './indicator-dots'

function FeatureIntroDialog() {
  const { isDialogOpen, openDialog, closeDialog } =
    useFeatureIntroDialogContext()
  const [step, setStep] = useState(1)
  const totalSteps = featureIntroConfig.length
  const currentConfig = featureIntroConfig[step - 1]

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      localStorage.setItem(FEATURE_INTRO_DIALOG_SEEN_KEY, 'true')
      closeDialog()
      setStep(1)
    }
  }

  const handleClose = () => {
    setStep(1)
    localStorage.setItem(FEATURE_INTRO_DIALOG_SEEN_KEY, 'true')
    closeDialog()
  }

  useEffect(() => {
    const hasSeenDialog =
      localStorage.getItem(FEATURE_INTRO_DIALOG_SEEN_KEY) === 'true'
    if (!hasSeenDialog) {
      openDialog()
    }
  }, [openDialog])

  const isTablet = useMediaQuery('(min-width: 768px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const size = isDesktop ? 'l' : isTablet ? 'm' : 's'
  const currentImageSrc = `/assets/images/feature-intro/onboarding_${step}_${size}.svg`

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleClose}>
      <DialogContent
        className="top-auto right-0 bottom-0 left-0 mx-auto h-min w-full max-w-none gap-0 overflow-hidden rounded-t-[30px] rounded-b-none bg-neutral-white tablet:top-1/2 tablet:left-1/2 tablet:h-min tablet:w-[480px] tablet:max-w-none tablet:-translate-x-1/2 tablet:-translate-y-1/2 tablet:gap-4 tablet:rounded-[30px] desktop:flex desktop:h-min desktop:w-[864px] desktop:flex-row hd:h-min"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Feature Intro</DialogTitle>

        <div className="relative h-[240px] w-full tablet:h-[280px] desktop:order-2 desktop:h-[480px] desktop:w-[384px]">
          <Image
            src={currentImageSrc}
            alt={`Onboarding step ${step}`}
            fill
            className={cn(step === 1 ? 'object-contain' : 'object-cover')}
            priority
          />
        </div>

        <div className="flex min-h-[328px] flex-col gap-5 px-6 pt-6 pb-0 tablet:min-h-[322px] tablet:gap-6 tablet:px-8 tablet:pt-8 tablet:pb-8 desktop:order-1 desktop:min-h-[480px] desktop:min-w-120 desktop:flex-1 desktop:gap-8 desktop:py-14 desktop:pl-12">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h2 className="prose-h3-small font-swei text-neutral-900 desktop:prose-h3-large">
                {currentConfig.title}
              </h2>
              <p className="prose-p1 text-neutral-700">
                {renderDescription(currentConfig.description)}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {currentConfig.tips.map((tip, index) => (
                <div key={index} className="flex items-center gap-1">
                  <CheckCircleIcon />
                  <span className="prose-p2-bold text-neutral-900">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto flex items-center justify-center gap-8 pb-5 tablet:pb-6 desktop:justify-start">
            <IndicatorDots current={step} total={totalSteps} />
            <Button
              variant="primary"
              size={44}
              onClick={handleNext}
              className="w-30 desktop:-order-1"
              aria-label={step === totalSteps ? '完成' : '下一步'}
            >
              {step === totalSteps ? '完成' : '下一步'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FeatureIntroDialog
