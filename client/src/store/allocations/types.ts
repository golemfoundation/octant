import { BigNumber } from 'ethers';

export interface AllocationsData {
  allocations: string[];
  rewardsForProposals: BigNumber;
}

export interface AllocationsMethods {
  addAllocations: (proposalAddresses: string[]) => void;
  reset: () => void;
  setAllocations: (proposalAddresses: string[]) => void;
  setRewardsForProposals: (rewardsForProposals: BigNumber) => void;
}
