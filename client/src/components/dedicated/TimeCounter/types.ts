export default interface TimeCounterProps {
  className?: string;
  duration?: number;
  isLoading?: boolean;
  onCountingFinish?: () => void;
  timestamp?: number;
  variant?: 'standard' | 'small' | 'metrics';
}

export interface CounterSectionsProps {
  isDividerVisible?: boolean;
  label: string;
  labelSmall?: string;
  value?: number;
  variant: TimeCounterProps['variant'];
}
