import { ProjectIpfsWithRewards } from 'hooks/queries/useProjectsIpfsWithRewards';

export default interface MetricsProjectsListProps {
  dataTest?: string;
  isLoading: boolean;
  numberOfSkeletons: number;
  projects: (ProjectIpfsWithRewards & { epoch: number })[];
}
