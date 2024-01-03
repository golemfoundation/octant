import React from 'react';

import { ProposalIpfsWithRewards } from 'hooks/queries/useProposalsIpfsWithRewards';
import { AllocationValue } from 'views/AllocationView/types';

export interface AllocationItemWithAllocations extends ProposalIpfsWithRewards {
  isAllocatedTo: boolean;
  value: string;
}

export default interface AllocationItemProps
  extends Omit<
    AllocationItemWithAllocations,
    'totalValueOfAllocations' | 'percentage' | 'numberOfDonors'
  > {
  className?: string;
  isError: boolean;
  onChange: (newAllocationValue: AllocationValue, isManualModeEnforced?: boolean) => void;
  onRemoveAllocationElement: () => void;
  setAddressesWithError: React.Dispatch<React.SetStateAction<string[]>>;
}
