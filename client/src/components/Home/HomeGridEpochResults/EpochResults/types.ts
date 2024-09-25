import { ProjectIpfsWithRewards } from 'hooks/queries/useProjectsIpfsWithRewards';

export default interface EpochResultsProps {
  className?: string;
  isLoading?: boolean;
  projects: (ProjectIpfsWithRewards & { epoch: number })[];
}
