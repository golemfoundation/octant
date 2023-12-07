import { CurrentMode } from '../types';

export default interface EarnGlmLockStepperProps {
  className?: string;
  currentMode: CurrentMode;
  step: 1 | 2 | 3;
}
