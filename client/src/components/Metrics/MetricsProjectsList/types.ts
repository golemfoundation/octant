import { BigNumber } from 'ethers';

export default interface MetricsProjectsListProps {
  epoch: number;
  isLoading: boolean;
  numberOfSkeletons: number;
  projects: { address: string; value: BigNumber }[];
}
