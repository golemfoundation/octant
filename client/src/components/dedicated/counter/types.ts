export default interface CounterProps {
  duration?: number;
  onCountingFinish: () => void;
  timestamp?: number;
}

export interface CounterSectionsProps {
  isNextEmpty?: boolean;
  label: string;
  value?: number;
}
