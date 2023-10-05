export const PROGRESS_BAR_COLORS = ['green', 'orange', 'grey'] as const;
export type ProgressBarColor = (typeof PROGRESS_BAR_COLORS)[number];

export default interface ProgressBarProps {
  className?: string;
  color?: ProgressBarColor;
  labelLeft?: string;
  labelRight?: string;
  progressPercentage: number;
  variant?: 'thin' | 'normal';
}
