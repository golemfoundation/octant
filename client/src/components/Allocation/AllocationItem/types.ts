import React from 'react';

import { LeverageMatched } from 'api/calls/allocate';
import { AllocateSimulate } from 'hooks/mutations/useAllocateSimulate';
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
  isThereAnyError: boolean;
  onChange: (newAllocationValue: AllocationValue, isManualModeEnforced?: boolean) => void;
  onRemoveAllocationElement: () => void;
  rewardsProps: {
    isLoadingAllocateSimulate: boolean;
    simulatedMatched?: LeverageMatched['value'];
    simulatedThreshold?: AllocateSimulate['threshold'];
  };
  setAddressesWithError: React.Dispatch<React.SetStateAction<string[]>>;
}
