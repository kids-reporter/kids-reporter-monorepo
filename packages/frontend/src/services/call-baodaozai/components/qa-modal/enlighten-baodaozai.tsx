'use client'

import {
  Alignment,
  Fit,
  Layout,
  RiveFile,
  useRive,
  useViewModel,
  useViewModelInstance,
  useViewModelInstanceArtboard,
  useViewModelInstanceEnum,
} from '@rive-app/react-webgl2'
import { useCallback, useEffect } from 'react'

import { STATE_MACHINE_NAME, VIEW_MODEL_NAME } from '../../context/constants'
import { QaBaodaozaiState } from '../../types'
import { mapQaActionToEyesAndMouthArtboard } from './utils'

type EnlightenBaodaozaiProps = {
  state: QaBaodaozaiState
  riveFile: RiveFile
}

const RIVE_LAYOUT = new Layout({
  fit: Fit.Layout,
  alignment: Alignment.Center,
})

function EnlightenBaodaozai({ state, riveFile }: EnlightenBaodaozaiProps) {
  const { RiveComponent, rive } = useRive({
    riveFile,
    stateMachines: STATE_MACHINE_NAME,
    autoplay: true,
    layout: RIVE_LAYOUT,
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

  const { setValue: setEyes } = useViewModelInstanceArtboard(
    'artboard_eyes',
    rootInstance
  )
  const { setValue: setMouth } = useViewModelInstanceArtboard(
    'artboard_mouth',
    rootInstance
  )

  const handleChangeArtboardType = useCallback(
    (artboardName: QaBaodaozaiState) => {
      if (rive) {
        const artboardType = rive.getArtboard(artboardName)
        setArtboardType(artboardType)
        const { eyes, mouth } = mapQaActionToEyesAndMouthArtboard(artboardName)
        setEyes(rive.getArtboard(eyes))
        setMouth(rive.getArtboard(mouth))
      }
    },
    [rive, setArtboardType, setEyes, setMouth]
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
