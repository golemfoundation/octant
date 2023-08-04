export const DESCRIPTION_VARIANTS = ['medium', 'big'] as const;
export type DescriptionVariant = (typeof DESCRIPTION_VARIANTS)[number];

export default interface DescriptionProps {
  className?: string;
  dataTest?: string;
  innerHtml?: string;
  text?: string;
  variant?: DescriptionVariant;
}
