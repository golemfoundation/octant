import { ProjectIpfsWithRewards } from 'hooks/queries/useProjectsIpfsWithRewards';

export default interface EpochResultsProps {
  className?: string;
  epoch: number;
  isLoading?: boolean;
  projects: ProjectIpfsWithRewards[];
}
