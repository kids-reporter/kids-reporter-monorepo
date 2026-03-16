'use client'

import { Button, cn, useBodyScrollLock } from '@kids-reporter/routing-ui'
import { useRiveFile } from '@rive-app/react-webgl2'
import { useCallback, useEffect, useMemo, useState } from 'react'

import envVars from '@/environment-variables'

import { CallBaodaozaiProps, useCallBaodaozaiContext } from '../../context'
import { BaodaozaiAction, BaodaozaiQuestions } from '../../types'
import { UPDATE_QA_MODAL_OVERRIDES } from './constants'
import EnlightenBaodaozai from './enlighten-baodaozai'
import { QAModalMode } from './types'
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
}

function QAModal({
  questions,
  onClose,
  onSubmit,
  isOpen,
  mode = 'default',
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
  }, [])

  const handleCancelLeaving = useCallback(() => {
    setIsLeaving(false)
  }, [])

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
    toLock: isOpen,
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
      return '再想一下'
    }
    if (mode === 'update') {
      return UPDATE_QA_MODAL_OVERRIDES.title
    }
    if (!currentModalStep) return null
    if (
      currentModalStep?.type === 'choice-result' ||
      currentModalStep?.type === 'essay-result'
    ) {
      return '作答結果'
    }
    return `${currentModalStep?.questionIndex + 1}/${questions.length}`
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
                    'w-full cursor-pointer rounded-2xl border-2 bg-white px-5 py-4 text-left transition-all',
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
            <span className="mt-5 flex items-center gap-2 prose-p1 text-neutral-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 17C12.2833 17 12.5208 16.9042 12.7125 16.7125C12.9042 16.5208 13 16.2833 13 16V12C13 11.7167 12.9042 11.4792 12.7125 11.2875C12.5208 11.0958 12.2833 11 12 11C11.7167 11 11.4792 11.0958 11.2875 11.2875C11.0958 11.4792 11 11.7167 11 12V16C11 16.2833 11.0958 16.5208 11.2875 16.7125C11.4792 16.9042 11.7167 17 12 17ZM12 9C12.2833 9 12.5208 8.90417 12.7125 8.7125C12.9042 8.52083 13 8.28333 13 8C13 7.71667 12.9042 7.47917 12.7125 7.2875C12.5208 7.09583 12.2833 7 12 7C11.7167 7 11.4792 7.09583 11.2875 7.2875C11.0958 7.47917 11 7.71667 11 8C11 8.28333 11.0958 8.52083 11.2875 8.7125C11.4792 8.90417 11.7167 9 12 9ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22ZM12 20C14.2333 20 16.125 19.225 17.675 17.675C19.225 16.125 20 14.2333 20 12C20 9.76667 19.225 7.875 17.675 6.325C16.125 4.775 14.2333 4 12 4C9.76667 4 7.875 4.775 6.325 6.325C4.775 7.875 4 9.76667 4 12C4 14.2333 4.775 16.125 6.325 17.675C7.875 19.225 9.76667 20 12 20Z"
                  fill="#8E8E8E"
                />
              </svg>
              答案送出後會公開在「小讀者觀點大集合」頁面。
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

            {/* Answer Section */}
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
                <p className="mb-4 prose-p1 text-neutral-700">你送出的回答：</p>
                <div className="w-full rounded-2xl border-2 border-neutral-200 bg-white p-4">
                  <span className="prose-p1-bold text-wrap break-words text-neutral-900">
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
    if (isLeaving) return null
    if (!currentModalStep) return null
    switch (currentModalStep.type) {
      case 'choice':
      case 'essay':
        return (
          <div className="pointer-events-none absolute -top-20 -left-12 z-4 tablet:-top-18 tablet:-left-6">
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
  }, [currentModalStep, isLeaving, riveFile])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-modal flex scrollbar-thin items-end justify-center tablet:items-center">
      <div className="absolute inset-0 z-0 bg-neutral-black/20" />
      <div
        className={cn(
          'relative z-1 flex h-[calc(100vh-80px)] w-full flex-col rounded-t-[30px] shadow-[0px_2px_16px_0px_rgba(0,0,0,0.15)] tablet:h-144 tablet:w-120 tablet:rounded-[30px]',
          isLeaving && 'h-auto tablet:h-auto'
        )}
      >
        <div className="relative flex flex-col items-center rounded-t-[30px] border-b-2 border-neutral-200 bg-neutral-white px-6 py-5 tablet:rounded-t-[30px] tablet:px-6 tablet:py-5">
          <span className="prose-h6-large text-neutral-900">
            {renderModalTitle}
          </span>
          {!isLeaving && (
            <button
              onClick={handleLeaving}
              className="absolute top-5 right-6 flex h-8 w-8 cursor-pointer items-center justify-center text-neutral-600 transition-colors hover:text-neutral-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
              >
                <path
                  d="M6.80748 6.80748C7.4909 6.12407 8.59894 6.12407 9.28236 6.80748L15.9999 13.525L22.7174 6.80748C23.4008 6.12407 24.5088 6.12407 25.1923 6.80748C25.8757 7.4909 25.8757 8.59894 25.1923 9.28236L18.4747 15.9999L25.1923 22.7174C25.8757 23.4008 25.8757 24.5088 25.1923 25.1923C24.5088 25.8757 23.4008 25.8757 22.7174 25.1923L15.9999 18.4747L9.28236 25.1923C8.59894 25.8757 7.4909 25.8757 6.80748 25.1923C6.12407 24.5088 6.12407 23.4008 6.80748 22.7174L13.525 15.9999L6.80748 9.28236C6.12407 8.59894 6.12407 7.4909 6.80748 6.80748Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          )}
          {renderBaodaozai}
        </div>

        <div
          className={
            'flex flex-1 flex-col overflow-hidden bg-neutral-white tablet:rounded-b-[30px]'
          }
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
      </div>
    </div>
  )
}

export default QAModal
