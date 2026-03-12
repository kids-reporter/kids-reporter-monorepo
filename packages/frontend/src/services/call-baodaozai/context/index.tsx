'use client'

import {
  useRive,
  useViewModel,
  useViewModelInstance,
  useViewModelInstanceArtboard,
  useViewModelInstanceBoolean,
  useViewModelInstanceEnum,
} from '@rive-app/react-webgl2'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import envVars from '@/environment-variables'

import { DialogBoxProps } from '../components/dialog-box'
import {
  BaodaozaiAction,
  BaodaozaiActionSetter,
  GeneralBaodaozaiState,
} from '../types'
import { mapGeneralActionToEyesAndMouthArtboard } from '../utils'
import {
  DEFAULT_ANIMATION_ENTER_DELAY,
  DEFAULT_ANIMATION_EXIT_DELAY,
  DIALOG_DEFAULT_CANCEL_TEXT,
  DIALOG_DEFAULT_CONFIRM_TEXT,
  DIALOG_DEFAULT_CONTENT,
  STATE_MACHINE_NAME,
  VIEW_MODEL_NAME,
} from './constants'

export type CallBaodaozaiProps = {
  dialogWithActionProps: Omit<DialogBoxProps, 'onConfirm' | 'onCancel'> & {
    confirmAction: BaodaozaiActionSetter
    cancelAction: BaodaozaiActionSetter
  }
  baodaozaiProps: {
    action: BaodaozaiAction
    setAction: (action: BaodaozaiAction) => void
    isActionEntered: boolean
    setIsActionEntered: (isActionEntered: boolean) => void
    hide: boolean
    setHide: (hide: boolean) => void
    isInitialized: boolean
    clickBaodaozaiAction: BaodaozaiAction | null
    setClickBaodaozaiAction: (
      clickBaodaozaiAction: BaodaozaiAction | null
    ) => void
  }
  renderBaodaozai: React.ReactNode
}

export type CallBaodaozaiState = {
  onDialogPropsChange: (
    dialogProps: Partial<CallBaodaozaiProps['dialogWithActionProps']>
  ) => void
} & CallBaodaozaiProps

const CallBaodaozaiContext = createContext<CallBaodaozaiState | null>(null)

export function CallBaodaozaiProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { RiveComponent, rive } = useRive({
    src: envVars.baodaozaiRiveFilePath,
    stateMachines: STATE_MACHINE_NAME,
    autoplay: true,
    isTouchScrollEnabled: true,
  })

  const rootViewModel = useViewModel(rive, { name: VIEW_MODEL_NAME })
  const rootInstance = useViewModelInstance(rootViewModel, {
    rive,
  })

  const { setValue: setArtboardType } = useViewModelInstanceArtboard(
    'artboard_type',
    rootInstance
  )

  const { setValue: setEyes } = useViewModelInstanceArtboard(
    'artboard_eyes',
    rootInstance
  )

  const { setValue: setMouth } = useViewModelInstanceArtboard(
    'artboard_mouth',
    rootInstance
  )

  const { setValue: setIsHover } = useViewModelInstanceBoolean(
    'Bool_isHover',
    rootInstance
  )

  const [currentAction, setCurrentAction] = useState<BaodaozaiAction>('default')

  const setAction = useCallback(
    (artboardName: GeneralBaodaozaiState) => {
      if (rive) {
        const artboardType = rive.getArtboard(artboardName)
        setArtboardType(artboardType)
        const { eyes, mouth } =
          mapGeneralActionToEyesAndMouthArtboard(artboardName)
        const eyesArtboard = rive.getArtboard(eyes)
        const mouthArtboard = rive.getArtboard(mouth)
        setEyes(eyesArtboard)
        setMouth(mouthArtboard)
        setCurrentAction(artboardName as BaodaozaiAction)
      }
    },
    [rive, setArtboardType, setEyes, setMouth]
  )

  const getCurrentArtboardType = useCallback(
    () => currentAction,
    [currentAction]
  )

  const [clickBaodaozaiAction, setClickBaodaozaiAction] =
    useState<BaodaozaiAction | null>(null)

  const [isAnimating, setIsAnimating] = useState(false)

  const [stateQueue, setStateQueue] = useState<
    {
      state?: BaodaozaiAction
      shouldTriggerExit: boolean
      isEntered?: boolean
    }[]
  >([])

  const { value: enterState, setValue: setEnterState } =
    useViewModelInstanceEnum('Enum_EnterState', rootInstance)

  useEffect(() => {
    if (currentAction === 'default') {
      setEnterState('enter')
    }
  }, [currentAction, setEnterState])

  const switchStateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const switchStateInnerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const cleanSwitchStateTimer = useCallback(() => {
    if (switchStateTimerRef.current) {
      clearTimeout(switchStateTimerRef.current)
      switchStateTimerRef.current = null
    }
    if (switchStateInnerTimerRef.current) {
      clearTimeout(switchStateInnerTimerRef.current)
      switchStateInnerTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      cleanSwitchStateTimer()
    }
  }, [cleanSwitchStateTimer])

  const handleSwitchState = useCallback(
    async ({
      state: nextState,
      shouldTriggerExit = true,
    }: {
      state: BaodaozaiAction
      shouldTriggerExit?: boolean
    }) => {
      if (nextState === currentAction) return
      setIsAnimating(true)
      if (
        shouldTriggerExit &&
        enterState === 'enter' &&
        currentAction !== 'default'
      ) {
        setEnterState('exit')
        cleanSwitchStateTimer()
        switchStateTimerRef.current = setTimeout(() => {
          setAction(nextState)
          setEnterState('enter')
          switchStateInnerTimerRef.current = setTimeout(() => {
            setIsAnimating(false)
          }, DEFAULT_ANIMATION_ENTER_DELAY)
        }, DEFAULT_ANIMATION_EXIT_DELAY)
      } else {
        setAction(nextState)
        setEnterState('enter')
        cleanSwitchStateTimer()
        switchStateTimerRef.current = setTimeout(() => {
          setIsAnimating(false)
        }, DEFAULT_ANIMATION_ENTER_DELAY)
      }
    },
    [currentAction, enterState, setEnterState, cleanSwitchStateTimer, setAction]
  )

  const handleSwitchEntered = useCallback(
    async ({ isEntered }: { isEntered: boolean }) => {
      setIsAnimating(true)
      setEnterState(isEntered ? 'enter' : 'exit')
      cleanSwitchStateTimer()
      switchStateTimerRef.current = setTimeout(() => {
        setIsAnimating(false)
      }, DEFAULT_ANIMATION_ENTER_DELAY)
    },
    [setEnterState, cleanSwitchStateTimer]
  )

  const handlePipeState = useCallback(
    ({
      state,
      shouldTriggerExit = true,
      isEntered,
    }: {
      state?: BaodaozaiAction
      shouldTriggerExit?: boolean
      isEntered?: boolean
    }) => {
      setStateQueue((prev) => {
        if (
          prev.length > 0 &&
          prev.slice(-1)[0].state === state &&
          prev.slice(-1)[0].isEntered === isEntered
        ) {
          return prev
        }
        return [...prev, { state, shouldTriggerExit, isEntered }]
      })
    },
    []
  )

  useEffect(() => {
    if (isAnimating) return
    if (stateQueue.length === 0) return
    const nextState = stateQueue[0]
    setStateQueue((prev) => prev.slice(1))
    if (nextState.isEntered !== undefined) {
      handleSwitchEntered({
        isEntered: nextState.isEntered,
      })
    } else if (nextState.state) {
      handleSwitchState({
        state: nextState.state,
        shouldTriggerExit: nextState.shouldTriggerExit,
      })
    }
  }, [isAnimating, stateQueue, handleSwitchState, handleSwitchEntered])

  const [dialogWithActionProps, setDialogWithActionProps] = useState<
    CallBaodaozaiProps['dialogWithActionProps']
  >({
    content: DIALOG_DEFAULT_CONTENT,
    confirmText: DIALOG_DEFAULT_CONFIRM_TEXT,
    cancelText: DIALOG_DEFAULT_CANCEL_TEXT,
    hideCancelButton: false,
    isOpen: false,
    confirmAction: () => {},
    cancelAction: () => {},
  })

  const onDialogPropsChange = useCallback(
    (newDialogProps: Partial<CallBaodaozaiProps['dialogWithActionProps']>) => {
      setDialogWithActionProps((prev) => ({ ...prev, ...newDialogProps }))
    },
    []
  )

  const [hide, setHide] = useState(true)

  const setBaodaozaiAction = useCallback(
    (action: BaodaozaiAction) => {
      handlePipeState({ state: action })
    },
    [handlePipeState]
  )

  const setIsActionEntered = useCallback(
    (isEntered: boolean) => {
      handlePipeState({ isEntered })
    },
    [handlePipeState]
  )

  const baodaozaiProps = useMemo(
    () => ({
      action: currentAction,
      setAction: setBaodaozaiAction,
      getCurrentArtboardType,
      hide,
      setHide,
      isInitialized: !!rootViewModel,
      isActionEntered: enterState === 'enter',
      setIsActionEntered,
      clickBaodaozaiAction,
      setClickBaodaozaiAction,
    }),
    [
      currentAction,
      setBaodaozaiAction,
      getCurrentArtboardType,
      hide,
      rootViewModel,
      enterState,
      setIsActionEntered,
      clickBaodaozaiAction,
    ]
  )

  const renderBaodaozai = useMemo(() => {
    return (
      <div
        className="transition-width transition-height h-25 w-25 scale-80 duration-1000 tablet:scale-100"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <RiveComponent />
      </div>
    )
  }, [RiveComponent, setIsHover])

  const contextValue: CallBaodaozaiState = useMemo(
    () => ({
      dialogWithActionProps,
      baodaozaiProps,
      renderBaodaozai,
      onDialogPropsChange,
    }),
    [
      dialogWithActionProps,
      baodaozaiProps,
      renderBaodaozai,
      onDialogPropsChange,
    ]
  )

  return (
    <CallBaodaozaiContext.Provider value={contextValue}>
      {children}
    </CallBaodaozaiContext.Provider>
  )
}

export function useCallBaodaozaiContext(): CallBaodaozaiState {
  const context = useContext(CallBaodaozaiContext)
  if (!context)
    throw new Error('Missing CallBaodaozaiContext.Provider in the tree')
  return context
}
