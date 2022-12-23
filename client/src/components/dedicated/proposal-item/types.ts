import { ExtendedProposal } from 'types/proposals';

export interface ProposalItemProps extends ExtendedProposal {
  isAlreadyAdded?: boolean;
  onAddRemoveFromAllocate: () => void;
  percentage: number;
  totalValueOfAllocations: string;
}
