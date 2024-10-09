import { ProjectsIpfsWithRewardsAndEpochs } from 'hooks/queries/useSearchedProjectsDetails';
import { OrderOption } from 'views/ProjectsView/types';

export default interface ProjectsSearchResultsProps {
  isLoading: boolean;
  orderOption: OrderOption;
  projectsIpfsWithRewardsAndEpochs: ProjectsIpfsWithRewardsAndEpochs[];
}
