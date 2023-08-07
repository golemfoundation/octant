import { ReactNode } from 'react';

export default interface TooltipProps {
  children: ReactNode;
  showForce?: boolean;
  text: string;
  wrapperClassname?: string;
}
