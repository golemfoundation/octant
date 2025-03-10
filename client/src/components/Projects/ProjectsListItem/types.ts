import { ProjectIpfsWithRewards } from 'hooks/queries/useProjectsIpfsWithRewards';

export default interface ProjectsListItemProps {
  className?: string;
  dataTest?: string;
  epoch?: number;
  isAnchorForTourguide?: boolean;
  projectIpfsWithRewards: ProjectIpfsWithRewards;
  searchResultsLabel?: string;
}
