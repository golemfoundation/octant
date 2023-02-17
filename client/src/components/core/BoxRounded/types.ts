import { ReactNode } from 'react';

import ButtonProps from 'components/core/Button/types';

export default interface BoxRoundedProps {
  alignment?: 'left' | 'center' | 'right';
  buttonProps?: ButtonProps;
  children: ReactNode;
  className?: string;
  expandableChildren?: ReactNode;
  isExpanded?: boolean;
  isGrey?: boolean;
  isVertical?: boolean;
  justifyContent?: 'center' | 'spaceBetween';
  onClick?: () => void;
  onToggle?: (isExpanded: boolean) => void;
  suffix?: string;
  tabs?: {
    isActive?: boolean;
    onClick?: () => void;
    title: string;
  }[];
  title?: string;
}
