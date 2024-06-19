import { ProjectIpfsWithRewards } from 'hooks/queries/useProjectsIpfsWithRewards';

export default interface RewardsWithoutThreshold {
  className?: string;
  epoch?: number;
  numberOfDonors: ProjectIpfsWithRewards['numberOfDonors'];
  totalValueOfAllocations: ProjectIpfsWithRewards['totalValueOfAllocations'];
}
