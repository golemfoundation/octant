import { CurrentMode } from '../types';

export default interface GlmLockTabsProps {
  className?: string;
  currentMode: CurrentMode;
  onClose: () => void;
  onInputsFocusChange: (value: boolean) => void;
  onReset: (mode: CurrentMode) => void;
  showBalances: boolean;
  step: 1 | 2 | 3;
}
