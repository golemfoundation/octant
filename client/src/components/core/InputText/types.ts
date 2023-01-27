export const INPUT_TEXT_VARIANTS = ['borderless', 'boxRounded', 'simple'];

export type InputTextVariant = (typeof INPUT_TEXT_VARIANTS)[number];

export default interface InputTextProps {
  className?: string;
  isDisabled?: boolean;
  label?: string;
  name?: string;
  onChange?: (event) => void;
  placeholder?: string;
  suffix?: string;
  value?: string;
  variant?: InputTextVariant;
}
