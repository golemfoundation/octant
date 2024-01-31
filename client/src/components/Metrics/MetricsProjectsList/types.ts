import { BigNumber } from 'ethers';

export default interface MetricsProjectsListProps {
  isLoading: boolean;
  numberOfSkeletons: number;
  projects: { address: string; value: BigNumber }[];
}
