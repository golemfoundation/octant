import { ReactNode } from 'react';

export default interface ModalProps {
  children: ReactNode;
  className?: string;
  header?: string;
  isOpen: boolean;
  isOverflowEnabled?: boolean;
  onClick?: () => void;
  onClosePanel: () => void;
}
