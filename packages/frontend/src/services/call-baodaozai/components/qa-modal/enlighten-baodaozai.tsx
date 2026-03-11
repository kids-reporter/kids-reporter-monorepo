'use client'

import {
  Fit,
  Layout,
  useRive,
  useViewModel,
  useViewModelInstance,
  useViewModelInstanceArtboard,
  useViewModelInstanceEnum,
} from '@rive-app/react-webgl2'
import { useCallback, useEffect } from 'react'

import envVars from '@/environment-variables'

import { STATE_MACHINE_NAME, VIEW_MODEL_NAME } from '../../context/constants'
import { QaBaodaozaiState } from '../../types'

type EnlightenBaodaozaiProps = {
  state: QaBaodaozaiState
}

function EnlightenBaodaozai({ state }: EnlightenBaodaozaiProps) {
  const { RiveComponent, rive } = useRive({
    src: envVars.baodaozaiRiveFilePath,
    stateMachines: STATE_MACHINE_NAME,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Layout,
      layoutScaleFactor: 1,
    }),
  })

  const rootViewModel = useViewModel(rive, { name: VIEW_MODEL_NAME })
  const rootInstance = useViewModelInstance(rootViewModel, {
    rive,
  })

  const { setValue: setArtboardType } = useViewModelInstanceArtboard(
    'artboard_type',
    rootInstance
  )

  const { setValue: setEnterState } = useViewModelInstanceEnum(
    'Enum_EnterState',
    rootInstance
  )

  const handleChangeArtboardType = useCallback(
    (artboardName: QaBaodaozaiState) => {
      if (rive) {
        const artboardType = rive.getArtboard(artboardName)
        setArtboardType(artboardType)
      }
    },
    [rive, setArtboardType]
  )

  useEffect(() => {
    handleChangeArtboardType(state)
    setEnterState('enter')
  }, [state, handleChangeArtboardType, setEnterState])

  return (
    <div className="h-[120px] w-[300px]">
      <RiveComponent />
    </div>
  )
}

export default EnlightenBaodaozai
