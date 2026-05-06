'use client'

import {
  Button,
  cn,
  useBodyScrollLock,
  useMediaQuery,
} from '@kids-reporter/routing-ui'
import { useRiveFile } from '@rive-app/react-webgl2'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import envVars from '@/environment-variables'

import { CallBaodaozaiProps, useCallBaodaozaiContext } from '../../context'
import { BaodaozaiAction, BaodaozaiQuestions } from '../../types'
import { UPDATE_QA_MODAL_OVERRIDES } from './constants'
import EnlightenBaodaozai from './enlighten-baodaozai'
import {
  CloseButton,
  FullscreenButton,
  FullscreenExitButton,
  MaximizeButton,
  MinimizeButton,
} from './icon-buttons'
import { QAModalDisplayState, QAModalMode } from './types'
import {
  getDefaultAnswerFromQuestions,
  getModalStepsFromQuestions,
  ModalStep,
} from './utils'

export type QAModalEvent = {
  setHide: (hide: boolean) => void
  setIsActionEntered: (isEntered: boolean) => void
  setAction: (action: BaodaozaiAction) => void
  setClickBaodaozaiAction: (action: BaodaozaiAction) => void
  onDialogPropsChange: (
    dialogProps: Partial<CallBaodaozaiProps['dialogWithActionProps']>
  ) => void
}

type QAModalProps = {
  questions: BaodaozaiQuestions
  onClose: ({
    setHide,
    setIsActionEntered,
    setAction,
    onDialogPropsChange,
  }: QAModalEvent) => void
  onSubmit: (answers: Record<number, string>, events: QAModalEvent) => void
  isOpen: boolean
  mode?: QAModalMode
  memberDisplayName: string
}

const SWIPE_THRESHOLD = 50

function QAModal({
  questions,
  onClose,
  onSubmit,
  isOpen,
  mode = 'default',
  memberDisplayName,
}: QAModalProps) {
  const { riveFile } = useRiveFile({
    src: envVars.baodaozaiRiveFilePath,
  })
  const [currentModalStepIndex, setCurrentModalStepIndex] = useState(0)
  const defaultAnswers = useMemo(
    () => getDefaultAnswerFromQuestions(questions),
    [questions]
  )
  const [answers, setAnswers] = useState<Record<number, string>>(defaultAnswers)
  const isCleanAnswers = useMemo(() => {
    if (Object.keys(answers).length !== Object.keys(defaultAnswers).length) {
      return false
    }
    return Object.keys(answers).every((key) => {
      const index = parseInt(key)
      return defaultAnswers[index] === answers[index]
    })
  }, [answers, defaultAnswers])

  const [isLeaving, setIsLeaving] = useState(false)

  const isMobile = useMediaQuery('(max-width: 767px)')

  const [displayState, setDisplayState] = useState<QAModalDisplayState>(
    isMobile ? 'mobile-expanded' : 'fullscreen'
  )

  useEffect(() => {
    if (isOpen) {
      setDisplayState(isMobile ? 'mobile-expanded' : 'fullscreen')
    }
  }, [isOpen, isMobile])

  const isContentVisible =
    isLeaving ||
    (displayState !== 'minimized' && displayState !== 'mobile-collapsed')

  const shouldLockScroll =
    isOpen &&
    (displayState === 'fullscreen' || displayState === 'mobile-expanded')

  const touchStartY = useRef<number | null>(null)

  const handleTitleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile) return
      touchStartY.current = e.touches[0].clientY
    },
    [isMobile]
  )

  const handleTitleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile || touchStartY.current === null) return
      const deltaY = e.changedTouches[0].clientY - touchStartY.current
      touchStartY.current = null

      if (displayState === 'mobile-expanded' && deltaY > SWIPE_THRESHOLD) {
        setDisplayState('mobile-collapsed')
      } else if (
        displayState === 'mobile-collapsed' &&
        deltaY < -SWIPE_THRESHOLD
      ) {
        setDisplayState('mobile-expanded')
      }
    },
    [isMobile, displayState]
  )

  const [previousNonMobileDisplayState, setPreviousNonMobileDisplayState] =
    useState<QAModalDisplayState>(displayState)
  const displayStateBeforeLeaving = useRef<QAModalDisplayState>(displayState)

  const handleTitleClick = useCallback(() => {
    switch (displayState) {
      case 'docked':
      case 'fullscreen': {
        setPreviousNonMobileDisplayState(displayState)
        setDisplayState('minimized')
        return
      }
      case 'minimized': {
        setDisplayState(previousNonMobileDisplayState)
        return
      }
      case 'mobile-collapsed': {
        setDisplayState('mobile-expanded')
        return
      }
      default:
        return
    }
  }, [displayState, previousNonMobileDisplayState])

  const handleMinimize = useCallback(() => {
    setDisplayState('minimized')
  }, [])

  const handleFullscreen = useCallback(() => {
    setDisplayState('fullscreen')
    setPreviousNonMobileDisplayState('fullscreen')
  }, [])

  const handleFullscreenExit = useCallback(() => {
    setDisplayState('docked')
    setPreviousNonMobileDisplayState('docked')
  }, [])

  const {
    baodaozaiProps: {
      setHide,
      setIsActionEntered,
      setAction,
      setClickBaodaozaiAction,
    },
    onDialogPropsChange,
  } = useCallBaodaozaiContext()

  const handleNext = useCallback(() => {
    setCurrentModalStepIndex(currentModalStepIndex + 1)
  }, [currentModalStepIndex])

  const handlePass = useCallback(
    (questionIndex: number) => {
      setCurrentModalStepIndex(currentModalStepIndex + 2)
      setAnswers((prev) => {
        const { [questionIndex]: _, ...rest } = prev
        return rest
      })
    },
    [currentModalStepIndex, setAnswers]
  )

  const shouldByPassOnLeaving = mode === 'update' && isCleanAnswers
  const handleShowLeaving = useCallback(() => {
    setIsLeaving(true)
    if (isMobile) return
    displayStateBeforeLeaving.current = displayState
    setDisplayState('fullscreen')
  }, [displayState, isMobile])

  const handleCancelLeaving = useCallback(() => {
    setIsLeaving(false)
    if (isMobile) return
    setDisplayState(displayStateBeforeLeaving.current)
  }, [isMobile])

  const events = useMemo(
    () => ({
      setHide,
      setIsActionEntered,
      setAction,
      onDialogPropsChange,
      setClickBaodaozaiAction,
    }),
    [
      setHide,
      setIsActionEntered,
      setAction,
      onDialogPropsChange,
      setClickBaodaozaiAction,
    ]
  )

  const handleConfirmLeaving = useCallback(() => {
    setIsLeaving(false)
    onClose(events)
  }, [onClose, events])

  const handleSubmit = useCallback(() => {
    onSubmit(answers, events)
  }, [onSubmit, answers, events])

  const handleAnswerChange = useCallback(
    (questionIndex: number, answer: string) => {
      setAnswers((prev) => ({ ...prev, [questionIndex]: answer }))
    },
    []
  )

  const modalSteps = useMemo(() => {
    return getModalStepsFromQuestions({
      questions,
      onNext: handleNext,
      onPass: handlePass,
      onSubmit: handleSubmit,
      mode,
    })
  }, [handleNext, handlePass, questions, handleSubmit, mode])

  const handleReset = useCallback(() => {
    setAnswers(defaultAnswers)
    setCurrentModalStepIndex(0)
    setIsLeaving(false)
  }, [defaultAnswers])

  useBodyScrollLock({
    toLock: shouldLockScroll,
    lockID: 'call-baodaozai-qa-modal',
  })

  useEffect(() => {
    if (!isOpen) {
      handleReset()
    }
    return () => {
      handleReset()
    }
  }, [isOpen, handleReset])

  const currentModalStep = useMemo<ModalStep | null>(() => {
    return modalSteps[currentModalStepIndex] ?? null
  }, [currentModalStepIndex, modalSteps])

  const isLastQuestion = useMemo(() => {
    if (!currentModalStep) return false
    return currentModalStep.questionIndex === questions.length - 1
  }, [currentModalStep, questions.length])

  const currentAnswer = useMemo(() => {
    if (!currentModalStep) return null
    return answers[currentModalStep?.questionIndex ?? 0]
  }, [answers, currentModalStep])

  const renderModalTitle = useMemo(() => {
    if (isLeaving) {
      return <span className="prose-h6-large">再想一下</span>
    }
    if (mode === 'update') {
      return (
        <span className="prose-h6-large">
          {UPDATE_QA_MODAL_OVERRIDES.title}
        </span>
      )
    }
    if (!currentModalStep) return null
    if (
      currentModalStep?.type === 'choice-result' ||
      currentModalStep?.type === 'essay-result'
    ) {
      return <span className="prose-h6-large">作答結果</span>
    }
    return (
      <span className="prose-h5-small">
        {currentModalStep?.questionIndex + 1}/{questions.length}
      </span>
    )
  }, [currentModalStep, questions.length, isLeaving, mode])

  const handleLeaving = useCallback(() => {
    return shouldByPassOnLeaving ? onClose(events) : handleShowLeaving()
  }, [shouldByPassOnLeaving, onClose, events, handleShowLeaving])

  const renderModalContent = useMemo(() => {
    if (isLeaving) {
      return (
        <div className="mb-5 flex w-full flex-col items-start p-6 tablet:mb-0">
          <h2 className="mb-3 prose-h6-large text-neutral-900">
            {mode === 'update'
              ? UPDATE_QA_MODAL_OVERRIDES.onLeavingModal.subtitle
              : '確定要放棄作答嗎？'}
          </h2>
          <p className="prose-p1 text-neutral-700">
            {mode === 'update'
              ? UPDATE_QA_MODAL_OVERRIDES.onLeavingModal.content
              : '你可以隨時呼叫報導仔，重新挑戰！'}
          </p>
        </div>
      )
    }
    if (!currentModalStep) return null

    switch (currentModalStep?.type) {
      case 'choice':
        return (
          <div className="flex w-full flex-col p-6 pb-10 tablet:pb-6">
            <div className="mb-6 w-full">
              <h2 className="prose-h6-large text-neutral-900">
                {currentModalStep.title}
              </h2>
            </div>

            <div className="mb-6 flex w-full flex-col gap-4">
              {currentModalStep.options.map((option, index) => (
                <button
                  key={option.content}
                  onClick={() =>
                    handleAnswerChange(
                      currentModalStep.questionIndex,
                      index.toString()
                    )
                  }
                  className={cn(
                    'w-full cursor-pointer rounded-2xl border-2 bg-white px-5 py-4 text-left transition-all duration-300',
                    answers[currentModalStep.questionIndex] === index.toString()
                      ? 'border-neutral-600'
                      : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100'
                  )}
                >
                  <span className={'prose-p1 text-neutral-900'}>
                    {index + 1}. {option.content}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )
      case 'essay':
        return (
          <div className="flex h-full w-full flex-col p-6 pb-10 tablet:pb-1">
            <div className="mb-6 w-full">
              <h2 className="mb-3 prose-h6-large text-neutral-900">
                {currentModalStep.title}
              </h2>
              <p className="prose-p1 text-neutral-700">
                tips: {currentModalStep.tips}
              </p>
            </div>

            <textarea
              className={cn(
                'h-38 min-h-38 w-full flex-1 resize-none rounded-2xl border-2 bg-white px-5 py-4 prose-p1 text-neutral-900 transition-all focus:outline-none',
                (answers[currentModalStep.questionIndex] || '').trim()
                  ? 'border-neutral-600'
                  : 'border-neutral-200 hover:border-neutral-600 focus:border-neutral-600'
              )}
              placeholder="請輸入答案"
              value={answers[currentModalStep.questionIndex] || ''}
              onChange={(e) =>
                handleAnswerChange(
                  currentModalStep.questionIndex,
                  e.target.value
                )
              }
            />
            <span className="mt-5 flex items-start gap-2 prose-p1 text-neutral-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="mt-0.5 shrink-0"
              >
                <path
                  d="M12 17C12.2833 17 12.5208 16.9042 12.7125 16.7125C12.9042 16.5208 13 16.2833 13 16V12C13 11.7167 12.9042 11.4792 12.7125 11.2875C12.5208 11.0958 12.2833 11 12 11C11.7167 11 11.4792 11.0958 11.2875 11.2875C11.0958 11.4792 11 11.7167 11 12V16C11 16.2833 11.0958 16.5208 11.2875 16.7125C11.4792 16.9042 11.7167 17 12 17ZM12 9C12.2833 9 12.5208 8.90417 12.7125 8.7125C12.9042 8.52083 13 8.28333 13 8C13 7.71667 12.9042 7.47917 12.7125 7.2875C12.5208 7.09583 12.2833 7 12 7C11.7167 7 11.4792 7.09583 11.2875 7.2875C11.0958 7.47917 11 7.71667 11 8C11 8.28333 11.0958 8.52083 11.2875 8.7125C11.4792 8.90417 11.7167 9 12 9ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22ZM12 20C14.2333 20 16.125 19.225 17.675 17.675C19.225 16.125 20 14.2333 20 12C20 9.76667 19.225 7.875 17.675 6.325C16.125 4.775 14.2333 4 12 4C9.76667 4 7.875 4.775 6.325 6.325C4.775 7.875 4 9.76667 4 12C4 14.2333 4.775 16.125 6.325 17.675C7.875 19.225 9.76667 20 12 20Z"
                  fill="#8E8E8E"
                />
              </svg>
              答案送出後會公開在「小讀者思辨牆」頁面，可前往個人資料頁修改留言顯示的暱稱。
            </span>
          </div>
        )
      case 'choice-result':
        return (
          <div className="flex h-full w-full flex-col bg-neutral-100">
            <div className="flex flex-col bg-neutral-white">
              <div className="mb-6 w-full px-6 pt-6">
                <h2 className="text-center prose-h6-large text-neutral-900">
                  {answers[currentModalStep.questionIndex] ===
                  currentModalStep.correctAnswerIndex.toString()
                    ? '厲害厲害！'
                    : '差了一點，別氣餒！'}
                </h2>
              </div>

              <div className="mb-6 flex w-full justify-center px-6">
                <div className="flex h-[120px] w-[300px] items-center justify-center">
                  <div className="flex h-full w-full items-center justify-center">
                    {riveFile && (
                      <EnlightenBaodaozai
                        state={
                          answers[currentModalStep.questionIndex] ===
                          currentModalStep.correctAnswerIndex.toString()
                            ? 'enlighten-correct'
                            : 'enlighten-fault'
                        }
                        riveFile={riveFile}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full bg-neutral-100 p-6 pb-10 tablet:pb-6">
              <div className="mb-4">
                <p className="mb-4 prose-p1 text-neutral-700">正確解答：</p>
                <div className="w-full rounded-2xl border-2 border-neutral-200 bg-white p-4">
                  <span className="prose-p1-bold text-neutral-900">
                    {currentModalStep.correctAnswerIndex + 1}.{' '}
                    {currentModalStep.correctAnswerContent}
                  </span>
                </div>
              </div>
              <p className="prose-p1 text-neutral-700">
                {currentModalStep.reason}
              </p>
            </div>
          </div>
        )
      case 'essay-result':
        return (
          <div className="flex h-full w-full flex-col bg-neutral-100">
            <div className="flex flex-col bg-neutral-white">
              <div className="mb-6 w-full px-6 pt-6">
                <h2 className="text-center prose-h6-large text-neutral-900">
                  這個觀點真不錯，謝謝你的分享
                </h2>
              </div>

              <div className="mb-6 flex w-full justify-center px-6">
                <div className="flex h-[120px] w-[300px] items-center justify-center">
                  <div className="flex h-full w-full items-center justify-center">
                    {riveFile && (
                      <EnlightenBaodaozai
                        state="enlighten-send"
                        riveFile={riveFile}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full bg-neutral-100 p-6 pb-10 tablet:pb-6">
              <div className="mb-4">
                <p className="mb-4 prose-p1 text-neutral-700">
                  <Link
                    href="/account"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {memberDisplayName} (你)
                  </Link>{' '}
                  送出的回答：
                </p>
                <div className="w-full rounded-2xl border-2 border-neutral-200 bg-white p-4">
                  <span className="prose-p1-bold text-wrap wrap-break-word text-neutral-900">
                    {currentAnswer}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }, [
    answers,
    currentAnswer,
    currentModalStep,
    handleAnswerChange,
    isLeaving,
    mode,
    riveFile,
    memberDisplayName,
  ])

  const renderModalButtons = useMemo(() => {
    if (isLeaving) {
      return (
        <div className="flex w-full gap-4">
          <Button
            onClick={handleCancelLeaving}
            variant="secondary"
            size={36}
            className="flex-1"
          >
            返回
          </Button>
          <Button
            onClick={handleConfirmLeaving}
            variant="primary"
            size={36}
            className="flex-1"
          >
            確定
          </Button>
        </div>
      )
    }
    if (!currentModalStep) return null
    switch (currentModalStep.type) {
      case 'choice':
      case 'essay':
        return (
          <div className="flex w-full gap-4">
            <Button
              onClick={
                mode === 'update' ? handleLeaving : currentModalStep.onPass
              }
              variant="secondary"
              size={36}
              className="flex-1"
            >
              {mode === 'update'
                ? UPDATE_QA_MODAL_OVERRIDES.cancelButtonText
                : '跳過'}
            </Button>
            <Button
              onClick={currentModalStep.onNext}
              disabled={
                !(currentAnswer || '').trim() ||
                (mode === 'update' && isCleanAnswers)
              }
              variant="primary"
              size={36}
              className="flex-1"
            >
              確定
            </Button>
          </div>
        )
      case 'choice-result':
        return (
          <Button
            onClick={currentModalStep.onNext}
            variant="primary"
            size={36}
            className="w-full"
          >
            {isLastQuestion ? '完成作答' : '下一題'}
          </Button>
        )
      case 'essay-result':
        return (
          <Button
            onClick={currentModalStep.onNext}
            variant="primary"
            size={36}
            className="w-full"
          >
            {isLastQuestion ? '完成作答' : '下一題'}
          </Button>
        )
      default:
        return null
    }
  }, [
    isLeaving,
    currentModalStep,
    handleCancelLeaving,
    handleConfirmLeaving,
    mode,
    handleLeaving,
    currentAnswer,
    isCleanAnswers,
    isLastQuestion,
  ])

  const renderBaodaozai = useMemo(() => {
    if (!isContentVisible) return null
    if (isLeaving) return null
    if (!currentModalStep) return null
    switch (currentModalStep.type) {
      case 'choice':
      case 'essay':
        return (
          <div className="pointer-events-none absolute -top-24 -left-12 -z-1 tablet:-left-10">
            {riveFile && (
              <EnlightenBaodaozai state="enlighten-ask" riveFile={riveFile} />
            )}
          </div>
        )
      case 'choice-result':
      case 'essay-result':
        return null
      default:
        return null
    }
  }, [currentModalStep, isLeaving, riveFile, isContentVisible])

  const renderTitleBarButtons = useMemo(() => {
    if (isLeaving) return null

    if (isMobile || mode === 'update') {
      return (
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <CloseButton onClick={handleLeaving} ariaLabel="Close" />
        </div>
      )
    }

    return (
      <div
        onClick={(e) => {
          e.stopPropagation()
        }}
        className="flex items-center gap-2"
      >
        {displayState !== 'minimized' && (
          <MinimizeButton onClick={handleMinimize} ariaLabel="Minimize" />
        )}
        {displayState === 'minimized' &&
          previousNonMobileDisplayState === 'fullscreen' && (
            <MaximizeButton onClick={handleFullscreen} ariaLabel="Fullscreen" />
          )}
        {displayState === 'minimized' &&
          previousNonMobileDisplayState === 'docked' && (
            <MaximizeButton
              onClick={handleFullscreenExit}
              ariaLabel="Fullscreen Exit"
            />
          )}
        {displayState === 'fullscreen' && (
          <FullscreenExitButton
            onClick={handleFullscreenExit}
            ariaLabel="Fullscreen Exit"
          />
        )}
        {displayState === 'docked' && (
          <FullscreenButton onClick={handleFullscreen} ariaLabel="Fullscreen" />
        )}
        {displayState === 'minimized' &&
          previousNonMobileDisplayState !== 'fullscreen' && (
            <FullscreenButton
              onClick={handleFullscreen}
              ariaLabel="Fullscreen"
            />
          )}
        {displayState === 'minimized' &&
          previousNonMobileDisplayState !== 'docked' && (
            <FullscreenExitButton
              onClick={handleFullscreenExit}
              ariaLabel="Fullscreen Exit"
            />
          )}
        <CloseButton onClick={handleLeaving} ariaLabel="Close" />
      </div>
    )
  }, [
    isLeaving,
    isMobile,
    mode,
    displayState,
    handleMinimize,
    handleFullscreenExit,
    previousNonMobileDisplayState,
    handleFullscreen,
    handleLeaving,
  ])

  if (!isOpen) return null

  const showBackdrop = displayState === 'fullscreen'

  return (
    <div
      className={cn(
        'fixed z-modal',
        displayState === 'fullscreen' &&
          'inset-0 flex items-center justify-center',
        displayState === 'mobile-expanded' &&
          'inset-0 flex items-end justify-center',
        displayState === 'mobile-collapsed' && 'right-0 bottom-0 left-0',
        displayState === 'docked' && 'right-8 bottom-0',
        displayState === 'minimized' && 'right-8 bottom-0'
      )}
    >
      {showBackdrop && (
        <div className="absolute inset-0 z-0 bg-neutral-black/20" />
      )}
      <div
        className={cn(
          'relative z-1 flex flex-col shadow-baodaozai-card',
          displayState === 'mobile-expanded' &&
            'h-[calc(100dvh-106px)] w-full rounded-t-[30px]',
          displayState === 'mobile-collapsed' && 'h-16 w-full rounded-t-[30px]',
          displayState === 'fullscreen' && 'h-144 w-120 rounded-[30px]',
          displayState === 'docked' && 'h-144 w-120 rounded-t-[30px]',
          displayState === 'minimized' && 'h-16 w-80 rounded-t-[30px]',
          isLeaving && isContentVisible && 'h-auto tablet:h-auto'
        )}
      >
        <div
          className={cn(
            'relative flex cursor-pointer items-center rounded-t-[30px] border-b-2 border-neutral-200 bg-red-100 px-6 py-[15px]',
            isMobile && 'touch-none',
            mode === 'update' && 'cursor-default'
          )}
          onTouchStart={mode === 'update' ? undefined : handleTitleTouchStart}
          onTouchEnd={mode === 'update' ? undefined : handleTitleTouchEnd}
          onClick={mode === 'update' ? undefined : handleTitleClick}
        >
          <div
            className={cn(
              'flex h-full flex-1 items-center text-neutral-900',
              isLeaving && 'justify-center'
            )}
          >
            {renderModalTitle}
          </div>
          {renderTitleBarButtons}
          {renderBaodaozai}
        </div>

        {isContentVisible && (
          <div
            className={cn(
              'flex flex-1 flex-col overflow-hidden bg-neutral-white',
              displayState === 'fullscreen' && 'rounded-b-[30px]'
            )}
          >
            <div className="flex flex-1 flex-col items-center overflow-y-auto">
              {renderModalContent}
            </div>
            <div
              className={cn(
                'flex w-full flex-col justify-end px-6 pt-5 pb-6 tablet:pt-6',
                (currentModalStep?.type === 'choice-result' ||
                  currentModalStep?.type === 'essay-result') &&
                  'bg-neutral-100',
                isLeaving && 'pt-0 tablet:pt-0'
              )}
            >
              {renderModalButtons}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QAModal
