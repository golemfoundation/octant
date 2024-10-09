import { ReactNode } from 'react';

export default interface DrawerProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}
