import { ReactNode } from 'react';

import ButtonProps from 'components/ui/Button/types';

export default interface BoxRoundedProps {
  alignment?: 'left' | 'center' | 'right';
  buttonProps?: ButtonProps;
  children: ReactNode;
  childrenWrapperClassName?: string;
  className?: string;
  dataTest?: string;
  expandableChildren?: ReactNode;
  hasPadding?: boolean;
  hasSections?: boolean;
  id?: string;
  isExpanded?: boolean;
  isGrey?: boolean;
  isVertical?: boolean;
  justifyContent?: 'center' | 'spaceBetween' | 'start';
  onClick?: () => void;
  onToggle?: (isExpanded: boolean) => void;
  subtitle?: string;
  subtitleClassName?: string;
  suffix?: string;
  tabs?: {
    isActive?: boolean;
    isDisabled?: boolean;
    onClick?: () => void;
    title: string;
  }[];
  textAlign?: 'center' | 'left' | 'right' | 'justify';
  title?: string;
  titleClassName?: string;
  titleSuffix?: ReactNode;
}
