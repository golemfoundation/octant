import { ButtonHTMLAttributes, ReactNode } from 'react';
import { LinkProps } from 'react-router-dom';

export type ButtonType = ButtonHTMLAttributes<Element>['type'];

export default interface ButtonProps {
  children?: ReactNode;
  href?: string;
  isActive?: boolean;
  isDisabled?: boolean;
  label?: string;
  onClick?: () => void;
  rel?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  to?: LinkProps['to'];
  type?: ButtonType;
}
