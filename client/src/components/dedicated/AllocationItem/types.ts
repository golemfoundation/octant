import { BigNumber } from 'ethers';

import { ProposalIpfsWithRewards } from 'hooks/queries/useProposalsIpfsWithRewards';

export interface AllocationItemWithAllocations
  extends Pick<
    ProposalIpfsWithRewards,
    'address' | 'isLoadingError' | 'name' | 'profileImageSmall'
  > {
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
