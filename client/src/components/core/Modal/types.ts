import { ReactNode } from 'react';

export interface TextProps {
  children: ReactNode;
}

export default interface ModalProps {
  Image?: ReactNode;
  children: ReactNode;
  className?: string;
  header?: string;
  isFullScreen?: boolean;
  isOpen: boolean;
  isOverflowEnabled?: boolean;
  onClosePanel: () => void;
}
