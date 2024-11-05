import { CurrentMode } from 'components/Home/HomeGridCurrentGlmLock/ModalLockGlm/LockGlm/types';

export default interface LockGlmBudgetBoxProps {
  className?: string;
  currentMode: CurrentMode;
  isCurrentlyLockedError?: boolean;
  isWalletBalanceError?: boolean;
}
