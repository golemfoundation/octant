import { BigNumber } from 'ethers';

import { CurrentMode } from 'components/dedicated/GlmLock/types';

export default interface GlmLockTabsProps {
  className?: string;
  currentMode: CurrentMode;
  onClose: () => void;
  onInputsFocusChange: (value: boolean) => void;
  onReset: (mode: CurrentMode) => void;
  setValueToDepose: (value: BigNumber) => void;
  showBalances: boolean;
  step: 1 | 2 | 3;
}
