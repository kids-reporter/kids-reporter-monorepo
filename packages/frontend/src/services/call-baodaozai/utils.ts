import {
  DEFAULT_ANIMATION_DIALOG_ENLIGHTEN_EXIT_DELAY,
  DEFAULT_ANIMATION_DIALOG_READ_EXIT_DELAY,
  DEFAULT_ANIMATION_DIALOG_SPEAKER_EXIT_DELAY,
  DEFAULT_ANIMATION_ENTER_DELAY,
} from './context/constants'
import { BaodaozaiAction } from './types'

export const mapActionToExitDelay = (action: BaodaozaiAction): number => {
  switch (action) {
    case 'dialog-read':
      return DEFAULT_ANIMATION_DIALOG_READ_EXIT_DELAY
    case 'dialog-enlighten':
      return DEFAULT_ANIMATION_DIALOG_ENLIGHTEN_EXIT_DELAY
    case 'dialog-speaker':
      return DEFAULT_ANIMATION_DIALOG_SPEAKER_EXIT_DELAY
    default:
      return DEFAULT_ANIMATION_ENTER_DELAY
  }
}
