export const PROGRESS_BAR_VARIANTS = ['green', 'orange', 'grey'] as const;
export type ProgressBarVariant = (typeof PROGRESS_BAR_VARIANTS)[number];

export default interface ProgressBarProps {
  className?: string;
  labelLeft?: string;
  labelRight?: string;
  progressPercentage: number;
  variant?: ProgressBarVariant;
}
