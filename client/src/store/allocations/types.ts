export interface AllocationsData {
  allocations: string[];
  rewardsForProposals: bigint;
}

export interface AllocationsMethods {
  addAllocations: (proposalAddresses: string[]) => void;
  removeAllocations: (proposalAddresses: string[]) => void;
  setAllocations: (proposalAddresses: string[]) => void;
  setRewardsForProposals: (rewardsForProposals: bigint) => void;
}
