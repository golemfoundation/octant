import { BigNumber } from 'ethers';

export default interface MetricsEpochGridTotalDonationsAndPersonalProps {
  className?: string;
  isLoading: boolean;
  totalDonations: BigNumber;
  totalPersonal: BigNumber;
}
