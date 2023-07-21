import { ReactNode, TouchEvent } from 'react';

export default interface ModalProps {
  Image?: ReactNode;
  bodyClassName?: string;
  children: ReactNode;
  className?: string;
  dataTest?: string;
  header?: string | ReactNode;
  headerClassName?: string;
  isFullScreen?: boolean;
  isOpen: boolean;
  isOverflowEnabled?: boolean;
  onClosePanel: () => void;
  onModalClosed?: () => void;
  onTouchMove?: (e: TouchEvent<HTMLDivElement>) => void;
  onTouchStart?: (e: TouchEvent<HTMLDivElement>) => void;
  showCloseButton?: boolean;
  variant?: 'standard' | 'small';
}
