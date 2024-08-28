import { CurrentMode } from 'components/Home/HomeGridCurrentGlmLock/ModalLockGlm/LockGlm/types';

export default interface LockGlmStepperProps {
  className?: string;
  currentMode: CurrentMode;
  step: 1 | 2 | 3;
}
