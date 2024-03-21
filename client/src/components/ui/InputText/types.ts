import { ChangeEvent, FocusEventHandler, HTMLAttributes, ReactNode } from 'react';

export const INPUT_TEXT_VARIANTS = ['allocation', 'simple'] as const;
export type InputTextVariant = (typeof INPUT_TEXT_VARIANTS)[number];

export default interface InputTextProps {
  autocomplete?: string;
  className?: string;
  dataTest?: string;
  error?: string | boolean;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  isButtonClearVisible?: boolean;
  isDisabled?: boolean;
  isErrorInlineVisible?: boolean;
  label?: string | ReactNode;
  mode?: string;
  name?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
  shouldAutoFocusAndSelect?: boolean;
  shouldAutoFocusAndSelectOnModeChange?: boolean;
  showLoader?: boolean;
  suffix?: string;
  suffixClassName?: string;
  textAlign?: 'left' | 'center' | 'right';
  value?: string;
  variant?: InputTextVariant;
}
