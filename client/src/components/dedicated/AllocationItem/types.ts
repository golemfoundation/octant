import { BigNumber } from 'ethers';

import { ProposalIpfsWithRewards } from 'hooks/queries/useProposalsIpfsWithRewards';

export interface AllocationItemWithAllocations extends ProposalIpfsWithRewards {
  isAllocatedTo: boolean;
  value: BigNumber;
}

export default interface AllocationItemProps
  extends Omit<AllocationItemWithAllocations, 'totalValueOfAllocations' | 'percentage'> {
  className?: string;
  isDisabled: boolean;
  isLocked: boolean;
  isManuallyEdited?: boolean;
  onSelectItem: (proposalAddress: string) => void;
}
