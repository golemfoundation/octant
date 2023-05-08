import { ReactNode } from 'react';

import ButtonProps from 'components/core/Button/types';

export default interface BoxRoundedProps {
  alignment?: 'left' | 'center' | 'right';
  buttonProps?: ButtonProps;
  children: ReactNode;
  className?: string;
  expandableChildren?: ReactNode;
  hasPadding?: boolean;
  hasSections?: boolean;
  isExpanded?: boolean;
  isGrey?: boolean;
  isVertical?: boolean;
  justifyContent?: 'center' | 'spaceBetween' | 'start';
  onClick?: () => void;
  onToggle?: (isExpanded: boolean) => void;
  suffix?: string;
  tabs?: {
    isActive?: boolean;
    onClick?: () => void;
    title: string;
  }[];
  title?: string;
  titleSuffix?: string;
}
