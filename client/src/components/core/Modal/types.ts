import { ReactNode, TouchEvent, MouseEventHandler } from 'react';

export default interface ModalProps {
  Image?: ReactNode;
  bodyClassName?: string;
  children: ReactNode;
  className?: string;
  dataTest?: string;
  header?: string | ReactNode;
  headerClassName?: string;
  isCloseButtonDisabled?: boolean;
  isFullScreen?: boolean;
  isOpen: boolean;
  isOverflowEnabled?: boolean;
  isOverflowOnClickDisabled?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  onClosePanel: () => void;
  onModalClosed?: () => void;
  onTouchMove?: (e: TouchEvent<HTMLDivElement>) => void;
  onTouchStart?: (e: TouchEvent<HTMLDivElement>) => void;
  overflowClassName?: string;
  showCloseButton?: boolean;
  variant?: 'standard' | 'small';
}
