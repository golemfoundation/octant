import { ReactNode } from 'react';

export default interface ModalProps {
  Image?: ReactNode;
  bodyClassName?: string;
  children: ReactNode;
  className?: string;
  dataTest?: string;
  header?: string;
  isFullScreen?: boolean;
  isOpen: boolean;
  isOverflowEnabled?: boolean;
  onClosePanel: () => void;
  onModalClosed?: () => void;
  variant?: 'standard' | 'small';
}
