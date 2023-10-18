import { ReactNode } from 'react';

export default interface TooltipProps {
  children: ReactNode;
  childrenClassName?: string;
  className?: string;
  dataTest?: string;
  onClickCallback?: () => boolean | Promise<boolean>;
  position?: 'bottom-right' | 'top';
  shouldShowOnClickMobile?: boolean;
  showForce?: boolean;
  text: string | ReactNode;
  tooltipClassName?: string;
  tooltipWrapperClassName?: string;
  variant?: 'small' | 'normal';
}
