import { BigNumber } from 'ethers';

import { ExtendedProposal } from 'types/proposals';

export interface ProposalWithAllocations extends ExtendedProposal {
  percentage: number | undefined;
  totalValueOfAllocations: BigNumber | undefined;
}

export default interface ProposalItemProps extends ProposalWithAllocations {
  className?: string;
  isAlreadyAdded?: boolean;
  onAddRemoveFromAllocate: () => void;
}
