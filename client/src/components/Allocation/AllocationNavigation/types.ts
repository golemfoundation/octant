import { CurrentView } from 'views/AllocationView/types';

export default interface AllocationNavigationProps {
  areButtonsDisabled: boolean;
  currentView: CurrentView;
  isLeftButtonDisabled: boolean;
  isLoading: boolean;
  isWaitingForAllMultisigSignatures?: boolean;
  onAllocate: () => void;
  onResetValues: () => void;
  setCurrentView: (newView: CurrentView) => void;
}
