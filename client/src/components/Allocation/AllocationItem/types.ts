import { BigNumber } from 'ethers';

import { ProposalIpfsWithRewards } from 'hooks/queries/useProposalsIpfsWithRewards';

export interface AllocationItemWithAllocations extends ProposalIpfsWithRewards {
  isAllocatedTo: boolean;
  value: BigNumber;
}

export default interface AllocationItemProps
  extends Omit<
    AllocationItemWithAllocations,
    'totalValueOfAllocations' | 'percentage' | 'numberOfDonors'
  > {
  className?: string;
  isManuallyEdited?: boolean;
  onChange: (address: string, newValue: string) => void;
}
