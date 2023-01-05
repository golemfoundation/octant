import { CurrentView } from 'views/allocation-view/types';

export default interface AllocationNavigationProps {
  areButtonsDisabled: boolean;
  currentView: CurrentView;
  isLoading: boolean;
  isSummaryEnabled: boolean;
  onResetAllocationValues: () => void;
  onVote: () => void;
  setCurrentView: (newView: CurrentView) => void;
}
