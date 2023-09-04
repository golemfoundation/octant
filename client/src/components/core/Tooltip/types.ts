import { ReactNode } from 'react';

export default interface TooltipProps {
  children: ReactNode;
  childrenClassName?: string;
  className?: string;
  dataTest?: string;
  onClickCallback?: () => boolean | Promise<boolean>;
  position?: 'bottom-right' | 'top';
  showForce?: boolean;
  text: string;
  tooltipClassName?: string;
  variant?: 'small' | 'normal';
}
