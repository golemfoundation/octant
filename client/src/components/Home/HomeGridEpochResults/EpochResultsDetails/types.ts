import { ProjectIpfsWithRewards } from 'hooks/queries/useProjectsIpfsWithRewards';

export default interface EpochResultsDetailsProps {
  details?: ProjectIpfsWithRewards & { epoch: number };
  isLoading?: boolean;
}
