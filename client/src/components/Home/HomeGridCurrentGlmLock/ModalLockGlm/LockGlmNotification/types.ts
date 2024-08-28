import { CurrentMode } from 'components/Home/HomeGridCurrentGlmLock/ModalLockGlm/LockGlm/types';

export default interface LockGlmNotificationProps {
  className?: string;
  currentMode: CurrentMode;
  isLockingApproved: boolean;
  transactionHash?: string;
  type: 'success' | 'info';
}
