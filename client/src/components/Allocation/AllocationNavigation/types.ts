export default interface AllocationNavigationProps {
  areButtonsDisabled: boolean;
  isLeftButtonDisabled: boolean;
  isLoading: boolean;
  isWaitingForAllMultisigSignatures?: boolean;
  onAllocate: () => void;
  onResetValues: () => void;
}
