import { ReactNode } from 'react';

export interface TextProps {
  children: ReactNode;
  className?: string;
}

export default interface ModalProps {
  Image?: ReactNode;
  children: ReactNode;
  className?: string;
  dataTest?: string;
  header?: string;
  isFullScreen?: boolean;
  isOpen: boolean;
  isOverflowEnabled?: boolean;
  onClosePanel: () => void;
}
