import { ProjectIpfsWithRewards } from 'hooks/queries/useProjectsIpfsWithRewards';

export default interface RewardsWithThresholdProps {
  address: string;
  className?: string;
  epoch?: number;
  isProjectView?: boolean;
  numberOfDonors: ProjectIpfsWithRewards['numberOfDonors'];
  showMoreInfo?: boolean;
  totalValueOfAllocations: ProjectIpfsWithRewards['totalValueOfAllocations'];
}
