export default interface MetricsEpochGridFundsUsageProps {
  className?: string;
  ethBelowThreshold: bigint;
  isLoading: boolean;
  totalUserDonationsWithPatronRewards: bigint;
  unusedRewards: bigint;
}
