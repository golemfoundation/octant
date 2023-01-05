import { ReactNode } from 'react';

import ButtonProps from 'components/core/Button/types';

export default interface BoxRoundedProps {
  alignment?: 'left' | 'center' | 'right';
  buttonProps?: ButtonProps;
  children: ReactNode;
  className?: string;
  isGrey?: boolean;
  isVertical?: boolean;
  justifyContent?: 'center' | 'spaceBetween';
  onClick?: () => void;
  tabs?: {
    isActive?: boolean;
    onClick?: () => void;
    title: string;
  }[];
  title?: string;
}
