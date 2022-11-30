import { ReactNode } from 'react';

export default interface BoxRoundedProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}
