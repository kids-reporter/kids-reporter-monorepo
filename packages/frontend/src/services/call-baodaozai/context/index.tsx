'use client'

import {
  useRive,
  useViewModel,
  useViewModelInstance,
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
import { BaodaozaiAction, BaodaozaiActionSetter } from '../types'
import {
  ARTBOARD_IDEL_NAME,
  DEFAULT_ANIMATION_DELAY,
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
    getActionEntered: (action: BaodaozaiAction) => boolean
    setActionEntered: (action: BaodaozaiAction, isEntered: boolean) => void
    isIdelReadStoned: boolean
    setIsIdelReadStoned: (isIdelReadStoned: boolean) => void
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
    src: envVars.baodaozaiIdelRiveFilePath,
    stateMachines: STATE_MACHINE_NAME,
    autoplay: true,
    artboard: ARTBOARD_IDEL_NAME,
  })

  const rootViewModel = useViewModel(rive, { name: VIEW_MODEL_NAME })
  const rootInstance = useViewModelInstance(rootViewModel, {
    rive,
  })

  const { value: action, setValue: setAction } = useViewModelInstanceEnum(
    'Enum_IdelDialog',
    rootInstance
  )

  const [clickBaodaozaiAction, setClickBaodaozaiAction] =
    useState<BaodaozaiAction | null>(null)

  const [isAnimating, setIsAnimating] = useState(false)

  const [stateQueue, setStateQueue] = useState<
    {
      state: BaodaozaiAction
      shouldTriggerExit: boolean
      isEntered?: boolean
    }[]
  >([])

  const { value: defaultEnterState, setValue: setDefaultEnterState } =
    useViewModelInstanceEnum('vmi_default/Enum_EnterState', rootInstance)
  const { value: idelSleepEnterState, setValue: setIdelSleepEnterState } =
    useViewModelInstanceEnum('vmi_idel-sleep/Enum_EnterState', rootInstance)
  const { value: idelReadEnterState, setValue: setIdelReadEnterState } =
    useViewModelInstanceEnum('vmi_idel-read/Enum_EnterState', rootInstance)
  const {
    value: idelEnlightenEnterState,
    setValue: setIdelEnlightenEnterState,
  } = useViewModelInstanceEnum(
    'vmi_idel-enlighten/Enum_EnterState',
    rootInstance
  )
  const {
    value: dialogSpeakerEnterState,
    setValue: setDialogSpeakerEnterState,
  } = useViewModelInstanceEnum(
    'vmi_dialog-speaker/Enum_EnterState',
    rootInstance
  )
  const { value: dialogReadEnterState, setValue: setDialogReadEnterState } =
    useViewModelInstanceEnum('vmi_dialog-read/Enum_EnterState', rootInstance)
  const {
    value: dialogEnlightenEnterState,
    setValue: setDialogEnlightenEnterState,
  } = useViewModelInstanceEnum(
    'vmi_dialog-enlighten/Enum_EnterState',
    rootInstance
  )

  useEffect(() => {
    if (action === 'default') {
      setDefaultEnterState('enter')
    }
  }, [action, setDefaultEnterState])

  const getEnterStateControl = useCallback(
    (state: BaodaozaiAction) => {
      switch (state) {
        case 'default':
          return { state: defaultEnterState, setState: setDefaultEnterState }
        case 'idel-sleep':
          return {
            state: idelSleepEnterState,
            setState: setIdelSleepEnterState,
          }
        case 'idel-read':
          return { state: idelReadEnterState, setState: setIdelReadEnterState }
        case 'idel-enlighten':
          return {
            state: idelEnlightenEnterState,
            setState: setIdelEnlightenEnterState,
          }
        case 'dialog-speaker':
          return {
            state: dialogSpeakerEnterState,
            setState: setDialogSpeakerEnterState,
          }
        case 'dialog-read':
          return {
            state: dialogReadEnterState,
            setState: setDialogReadEnterState,
          }
        case 'dialog-enlighten':
          return {
            state: dialogEnlightenEnterState,
            setState: setDialogEnlightenEnterState,
          }
        default:
          return null
      }
    },
    [
      defaultEnterState,
      idelSleepEnterState,
      idelReadEnterState,
      idelEnlightenEnterState,
      dialogSpeakerEnterState,
      dialogReadEnterState,
      dialogEnlightenEnterState,
      setDefaultEnterState,
      setIdelSleepEnterState,
      setIdelReadEnterState,
      setIdelEnlightenEnterState,
      setDialogSpeakerEnterState,
      setDialogReadEnterState,
      setDialogEnlightenEnterState,
    ]
  )

  const { value: isStoned, setValue: setIsStoned } =
    useViewModelInstanceBoolean('vmi_idel-read/Bool_Stoned', rootInstance)

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
      if (nextState === action) return
      setIsAnimating(true)
      if (
        shouldTriggerExit &&
        getEnterStateControl(action as BaodaozaiAction)?.state === 'enter' &&
        action !== 'default'
      ) {
        getEnterStateControl(action as BaodaozaiAction)?.setState('exit')
        cleanSwitchStateTimer()
        switchStateTimerRef.current = setTimeout(() => {
          setAction(nextState)
          getEnterStateControl(nextState)?.setState('enter')
          switchStateInnerTimerRef.current = setTimeout(() => {
            setIsAnimating(false)
          }, DEFAULT_ANIMATION_DELAY)
        }, DEFAULT_ANIMATION_DELAY)
      } else {
        setAction(nextState)
        getEnterStateControl(nextState)?.setState('enter')
        cleanSwitchStateTimer()
        switchStateTimerRef.current = setTimeout(() => {
          setIsAnimating(false)
        }, DEFAULT_ANIMATION_DELAY)
      }
    },
    [action, setAction, getEnterStateControl, cleanSwitchStateTimer]
  )

  const handleSwitchEntered = useCallback(
    async ({
      state: nextState,
      isEntered,
    }: {
      state: BaodaozaiAction
      isEntered: boolean
    }) => {
      setIsAnimating(true)
      setAction(nextState)
      getEnterStateControl(nextState)?.setState(isEntered ? 'enter' : 'exit')
      cleanSwitchStateTimer()
      switchStateTimerRef.current = setTimeout(() => {
        setIsAnimating(false)
      }, DEFAULT_ANIMATION_DELAY)
    },
    [getEnterStateControl, setAction, cleanSwitchStateTimer]
  )

  const handlePipeState = useCallback(
    ({
      state,
      shouldTriggerExit = true,
      isEntered,
    }: {
      state: BaodaozaiAction
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
        state: nextState.state,
        isEntered: nextState.isEntered,
      })
    } else {
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

  const getActionEntered = useCallback(
    (action: BaodaozaiAction) => {
      return getEnterStateControl(action)?.state === 'enter'
    },
    [getEnterStateControl]
  )

  const setBaodaozaiAction = useCallback(
    (action: BaodaozaiAction) => {
      handlePipeState({ state: action })
    },
    [handlePipeState]
  )

  const setActionEntered = useCallback(
    (action: BaodaozaiAction, isEntered: boolean) => {
      handlePipeState({ state: action, isEntered })
    },
    [handlePipeState]
  )

  const baodaozaiProps = useMemo(
    () => ({
      action: action as BaodaozaiAction,
      setAction: setBaodaozaiAction,
      hide,
      setHide,
      isIdelReadStoned: !!isStoned,
      setIsIdelReadStoned: setIsStoned,
      isInitialized: !!rootViewModel,
      getActionEntered,
      setActionEntered,
      clickBaodaozaiAction,
      setClickBaodaozaiAction,
    }),
    [
      action,
      setBaodaozaiAction,
      hide,
      isStoned,
      setIsStoned,
      rootViewModel,
      getActionEntered,
      setActionEntered,
      clickBaodaozaiAction,
      setClickBaodaozaiAction,
    ]
  )

  const renderBaodaozai = useMemo(() => {
    return (
      <div className="transition-width transition-height h-25 w-25 duration-1000">
        <RiveComponent />
      </div>
    )
  }, [RiveComponent])

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
