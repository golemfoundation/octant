export interface AllocationsData {
  allocations: string[];
  rewardsForProposals: bigint;
}

export interface AllocationsMethods {
  addAllocations: (projectAddresses: string[]) => void;
  removeAllocations: (projectAddresses: string[]) => void;
  setAllocations: (projectAddresses: string[]) => void;
  setRewardsForProposals: (rewardsForProposals: bigint) => void;
}
