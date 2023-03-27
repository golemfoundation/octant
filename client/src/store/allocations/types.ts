export type AllocationsData = null | string[];

export interface AllocationsStore {
  data: AllocationsData;
  reset: () => void;
  setAllocations: (proposalAddresses: string[]) => void;
}
