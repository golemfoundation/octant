export default interface TimeCounterProps {
  className?: string;
  duration?: number;
  onCountingFinish?: () => void;
  timestamp?: number;
  variant?: 'standard' | 'small';
}

export interface CounterSectionsProps {
  isDividerVisible?: boolean;
  label: string;
  labelSmall?: string;
  value?: number;
  variant: TimeCounterProps['variant'];
}
