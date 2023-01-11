import { CurrentView } from 'views/AllocationView/types';

export default interface AllocationNavigationProps {
  areButtonsDisabled: boolean;
  currentView: CurrentView;
  isLoading: boolean;
  isSummaryEnabled: boolean;
  onAllocate: () => void;
  onResetAllocationValues: () => void;
  setCurrentView: (newView: CurrentView) => void;
}
