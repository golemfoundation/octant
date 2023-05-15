export type AllocationsData = null | string[];

export interface AllocationsStore {
  addAllocations: (proposalAddresses: string[]) => void;
  data: AllocationsData;
  reset: () => void;
  setAllocations: (proposalAddresses: string[]) => void;
}
