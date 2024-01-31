import { BigNumber } from 'ethers';

export default interface MetricsEpochGridDonationsVsPersonalAllocationsProps {
  className?: string;
  isLoading: boolean;
  totalDonations: BigNumber;
  totalPersonal: BigNumber;
}
