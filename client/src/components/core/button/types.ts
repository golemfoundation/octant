import { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonType = ButtonHTMLAttributes<Element>['type'];

export default interface ButtonProps {
  children?: ReactNode;
  href?: string;
  label?: string;
  onClick?: () => void;
  rel?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  type?: ButtonType;
}
