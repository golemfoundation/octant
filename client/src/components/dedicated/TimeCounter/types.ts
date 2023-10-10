export default interface TimeCounterProps {
  className?: string;
  duration?: number;
  isLoading?: boolean;
  onCountingFinish?: () => void;
  timestamp?: number;
  variant?: 'standard' | 'metrics';
}

export interface CounterSectionsProps {
  isDividerVisible?: boolean;
  label: string;
  value?: number;
  variant: TimeCounterProps['variant'];
}
