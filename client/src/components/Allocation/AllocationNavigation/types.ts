export default interface AllocationNavigationProps {
  isLeftButtonDisabled: boolean;
  isLoading: boolean;
  isLocked?: boolean;
  isRightButtonDisabled: boolean;
  onAllocate: () => void;
  onEdit: () => void;
  onResetValues: () => void;
}
