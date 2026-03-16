import { GeneralBaodaozaiState } from './types'

export const mapGeneralActionToEyesAndMouthArtboard = (
  action: GeneralBaodaozaiState
): { eyes: string; mouth: string } => {
  switch (action) {
    case 'idle-sleep':
      return {
        eyes: 'eyes-sleepy',
        mouth: 'mouth-omouth',
      }
    case 'idle-read':
      return {
        eyes: 'eyes-blink',
        mouth: 'mouth-smile',
      }
    case 'idle-enlighten':
      return {
        eyes: 'eyes-look-horizontal',
        mouth: 'mouth-smile',
      }
    case 'dialog-speaker':
      return {
        eyes: 'eyes-speaker',
        mouth: 'mouth-omouth',
      }
    case 'dialog-read':
      return { eyes: 'eyes-look-horizontal', mouth: 'mouth-smile' }
    case 'dialog-enlighten':
      return { eyes: 'eyes-look-vertical', mouth: 'mouth-omouth' }
    default:
      return {
        eyes: 'eyes-look-horizontal',
        mouth: 'mouth-smile',
      }
  }
}
