import { ProjectIpfsWithRewards } from 'hooks/queries/useProjectsIpfsWithRewards';

export default interface ProjectsListItemProps {
  className?: string;
  dataTest?: string;
  epoch?: number;
  projectIpfsWithRewards: ProjectIpfsWithRewards;
  searchResultsLabel?: string;
}
