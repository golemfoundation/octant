import { ReactNode, MouseEventHandler } from 'react';

export default interface DrawerProps {
  CustomCloseButton?: ReactNode;
  children: ReactNode;
  dataTest?: string;
  isOpen: boolean;
  onClose: () => void;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
  onMouseOver?: MouseEventHandler<HTMLDivElement>;
}
