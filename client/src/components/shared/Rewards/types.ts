import { ProjectIpfsWithRewards } from 'hooks/queries/useProjectsIpfsWithRewards';

export default interface RewardsProps {
  address: string;
  className?: string;
  epoch?: number;
  isProjectView?: boolean;
  numberOfDonors: ProjectIpfsWithRewards['numberOfDonors'];
  totalValueOfAllocations: ProjectIpfsWithRewards['totalValueOfAllocations'];
}
