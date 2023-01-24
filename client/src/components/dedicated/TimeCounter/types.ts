export default interface TimeCounterProps {
  className?: string;
  duration?: number;
  onCountingFinish: () => void;
  timestamp?: number;
}

export interface CounterSectionsProps {
  isDividerVisible?: boolean;
  label: string;
  value?: number;
}
