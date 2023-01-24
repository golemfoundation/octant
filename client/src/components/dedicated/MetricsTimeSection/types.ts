export default interface MetricsTimeSectionProps {
  className: string;
  currentEpoch?: number;
  isDecisionWindowOpen?: boolean;
  onCountingFinish: () => void;
}
