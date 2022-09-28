import { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonType = ButtonHTMLAttributes<Element>['type'];

export default interface ButtonProps {
  children?: ReactNode;
  label?: string;
  onClick: () => void;
  type?: ButtonType;
}
