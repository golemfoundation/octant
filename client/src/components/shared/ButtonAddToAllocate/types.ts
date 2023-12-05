export default interface ButtonAddToAllocateProps {
  className?: string;
  dataTest?: string;
  isAddedToAllocate: boolean;
  isAllocatedTo: boolean;
  isArchivedProposal?: boolean;
  onClick: () => void;
}
