import { CurrentMode } from 'components/dedicated/GlmLock/types';

export default interface GlmLockNotificationProps {
  className?: string;
  currentMode: CurrentMode;
  isLockingApproved: boolean;
  transactionHash?: string;
  type: 'success' | 'info';
}
