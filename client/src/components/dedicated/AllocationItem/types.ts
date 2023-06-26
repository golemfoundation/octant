import { BigNumber } from 'ethers';

import { ProposalWithRewards } from 'hooks/queries/useProposalsWithRewards';

export interface AllocationItemWithAllocations extends ProposalWithRewards {
  isAllocatedTo: boolean;
  value: BigNumber;
}

export default interface AllocationItemProps extends AllocationItemWithAllocations {
  className?: string;
  isDisabled: boolean;
  isLocked: boolean;
  isManuallyEdited?: boolean;
  onSelectItem: (proposalAddress: string) => void;
}
