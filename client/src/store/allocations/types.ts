export interface AllocationsData {
  allocations: string[];
}

export interface AllocationsMethods {
  addAllocations: (proposalAddresses: string[]) => void;
  reset: () => void;
  setAllocations: (proposalAddresses: string[]) => void;
}
