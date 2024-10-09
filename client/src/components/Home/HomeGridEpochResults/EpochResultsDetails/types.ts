import { ProjectIpfsWithRewards } from 'hooks/queries/useProjectsIpfsWithRewards';

export default interface EpochResultsDetailsProps {
  details?: ProjectIpfsWithRewards;
  epoch: number;
  isDragging: boolean;
  isLoading?: boolean;
  isScrollable: boolean;
  scrollDirection: 'right' | 'left';
}
