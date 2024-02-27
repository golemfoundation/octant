import { CurrentMode } from 'components/Earn/EarnGlmLock/types';

export default interface EarnGlmLockTabsProps {
  className?: string;
  currentMode: CurrentMode;
  isLoading: boolean;
  onClose: () => void;
  onInputsFocusChange: (value: boolean) => void;
  onReset: (mode: CurrentMode) => void;
  setValueToDepose: (value: bigint) => void;
  showBalances: boolean;
  step: 1 | 2 | 3;
}
