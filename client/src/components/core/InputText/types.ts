import { ChangeEvent } from 'react';

export const INPUT_TEXT_VARIANTS = ['borderless', 'boxRounded', 'simple'] as const;
export type InputTextVariant = (typeof INPUT_TEXT_VARIANTS)[number];

export default interface InputTextProps {
  className?: string;
  error?: string;
  isDisabled?: boolean;
  isErrorInlineVisible?: boolean;
  label?: string;
  name?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  placeholder?: string;
  suffix?: string;
  value?: string;
  variant?: InputTextVariant;
}
