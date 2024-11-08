import { ReactNode } from 'react';

export default interface DrawerProps {
  children: ReactNode;
  dataTest?: string;
  isOpen: boolean;
  onClose: () => void;
}
