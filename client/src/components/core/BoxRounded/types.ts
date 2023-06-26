import { ReactNode } from 'react';

import ButtonProps from 'components/core/Button/types';

export default interface BoxRoundedProps {
  alignment?: 'left' | 'center' | 'right';
  buttonProps?: ButtonProps;
  children: ReactNode;
  className?: string;
  dataTest?: string;
  expandableChildren?: ReactNode;
  hasPadding?: boolean;
  hasSections?: boolean;
  isExpanded?: boolean;
  isGrey?: boolean;
  isVertical?: boolean;
  justifyContent?: 'center' | 'spaceBetween' | 'start';
  onClick?: () => void;
  onToggle?: (isExpanded: boolean) => void;
  subtitle?: string;
  suffix?: string;
  tabs?: {
    isActive?: boolean;
    onClick?: () => void;
    title: string;
  }[];
  textAlign?: 'center' | 'left' | 'right' | 'justify';
  title?: string;
  titleSuffix?: string;
}
