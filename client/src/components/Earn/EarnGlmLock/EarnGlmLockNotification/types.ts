import { CurrentMode } from 'components/Earn/EarnGlmLock/types';

export default interface EarnGlmLockNotificationProps {
  className?: string;
  currentMode: CurrentMode;
  isLockingApproved: boolean;
  transactionHash?: string;
  type: 'success' | 'info';
}
