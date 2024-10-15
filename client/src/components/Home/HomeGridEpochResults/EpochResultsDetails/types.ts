import { ProjectIpfsWithRewards } from 'hooks/queries/useProjectsIpfsWithRewards';

export default interface EpochResultsDetailsProps {
  details?: ProjectIpfsWithRewards;
  epoch: number;
  isDragging: boolean;
  isLoading?: boolean;
  isScrollable: boolean;
  onMouseDown: (pageX: number) => void;
  onMouseMove: (pageX: number) => void;
  scrollDirection: 'right' | 'left';
}
