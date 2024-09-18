import { OrderOption } from 'views/ProjectsView/types';

export default interface ProjectsListProps {
  areCurrentEpochsProjectsHiddenOutsideAllocationWindow?: boolean;
  epoch?: number;
  isFirstArchive?: boolean;
  orderOption: OrderOption;
}
