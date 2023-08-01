import { CurrentMode } from '../types';

export default interface GlmLockStepperProps {
  className?: string;
  currentMode: CurrentMode;
  step: 1 | 2 | 3;
}
