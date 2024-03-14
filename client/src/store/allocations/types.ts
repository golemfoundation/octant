export interface AllocationsData {
  allocations: string[];
  rewardsForProjects: bigint;
}

export interface AllocationsMethods {
  addAllocations: (projectAddresses: string[]) => void;
  removeAllocations: (projectAddresses: string[]) => void;
  setAllocations: (projectAddresses: string[]) => void;
  setRewardsForProjects: (rewardsForProjects: bigint) => void;
}
