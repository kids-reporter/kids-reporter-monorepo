'use client'

import {
  useRive,
  useViewModel,
  useViewModelInstance,
  useViewModelInstanceEnum,
} from '@rive-app/react-webgl2'
import { useEffect, useRef } from 'react'

import envVars from '@/environment-variables'

import {
  ARTBOARD_ENLIGHTEN_NAME,
  STATE_MACHINE_NAME,
} from '../../context/constants'
import { QaBaodaozaiState } from '../../types'
import { ENLIGHTEN_BAODAOZAI_STATE_CHANGE_DELAY } from './constants'
const ROOT_VIEW_MODEL_NAME = 'VM_EnlightenSelector'

type EnlightenBaodaozaiProps = {
  state: QaBaodaozaiState
}

function EnlightenBaodaozai({ state }: EnlightenBaodaozaiProps) {
  const { RiveComponent, rive } = useRive({
    src: envVars.baodaozaiEnlightenRiveFilePath,
    stateMachines: STATE_MACHINE_NAME,
    autoplay: true,
    artboard: ARTBOARD_ENLIGHTEN_NAME,
  })

  const rootViewModel = useViewModel(rive, { name: ROOT_VIEW_MODEL_NAME })
  const rootInstance = useViewModelInstance(rootViewModel, {
    rive,
  })

  const { setValue: setEnlighten } = useViewModelInstanceEnum(
    'Enum_Enlighten',
    rootInstance
  )

  const { setValue: setEnlightenSendEnterState } = useViewModelInstanceEnum(
    'vmi_enlighten-send/Enum_EnterState',
    rootInstance
  )

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const cleanTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    async function setState() {
      setEnlighten(state)
      if (state === 'enlighten-send') {
        setEnlightenSendEnterState('enter')
        cleanTimer()
        timerRef.current = setTimeout(() => {
          setEnlightenSendEnterState('exit')
        }, ENLIGHTEN_BAODAOZAI_STATE_CHANGE_DELAY)
      }
    }
    setState()

    return () => {
      cleanTimer()
    }
  }, [state, setEnlighten, setEnlightenSendEnterState])

  return (
    <div className="h-[120px] w-[300px]">
      <RiveComponent />
    </div>
  )
}

export default EnlightenBaodaozai
