import { CurrentMode } from 'components/dedicated/GlmLock/types';

export default interface GlmLockNotificationProps {
  className?: string;
  currentMode: CurrentMode;
  transactionHash?: string;
  type: 'success' | 'info';
}
