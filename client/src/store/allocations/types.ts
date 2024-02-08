import { BigNumber } from 'ethers';

export interface AllocationsData {
  allocations: string[];
  rewardsForProposals: BigNumber;
}

export interface AllocationsMethods {
  addAllocations: (proposalAddresses: string[]) => void;
  removeAllocations: (proposalAddresses: string[]) => void;
  setAllocations: (proposalAddresses: string[]) => void;
  setRewardsForProposals: (rewardsForProposals: BigNumber) => void;
}
