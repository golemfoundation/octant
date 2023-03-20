export const DOUBLE_VALUE_VARIANTS = ['standard', 'small'];
export type DoubleValueVariant = (typeof DOUBLE_VALUE_VARIANTS)[number];

export default interface DoubleValueProps {
  alternativeValue?: string;
  className?: string;
  mainValue: string | number;
  variant?: DoubleValueVariant;
}
