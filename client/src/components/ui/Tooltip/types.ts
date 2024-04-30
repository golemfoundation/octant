import { ReactNode } from 'react';

export default interface TooltipProps {
  children: ReactNode;
  childrenClassName?: string;
  className?: string;
  dataTest?: string;
  hideAfterClick?: boolean;
  isDisabled?: boolean;
  onClickCallback?: () => void;
  onVisibilityChange?: (isVisible: boolean) => void;
  position?: 'bottom-right' | 'top' | 'custom';
  shouldShowOnClickMobile?: boolean;
  showDelay?: number;
  showForce?: boolean;
  text: string | ReactNode;
  tooltipClassName?: string;
  tooltipWrapperClassName?: string;
  variant?: 'small' | 'normal';
}
