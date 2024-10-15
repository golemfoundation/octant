import { ProjectIpfsWithRewards } from 'hooks/queries/useProjectsIpfsWithRewards';

export default interface RewardsWithoutThresholdProps {
  address: string;
  className?: string;
  donations?: ProjectIpfsWithRewards['donations'];
  epoch?: number;
  matchedRewards?: ProjectIpfsWithRewards['matchedRewards'];
  numberOfDonors: ProjectIpfsWithRewards['numberOfDonors'];
  showMoreInfo?: boolean;
  totalValueOfAllocations: ProjectIpfsWithRewards['totalValueOfAllocations'];
  variant: 'projectView' | 'projectsView';
}
