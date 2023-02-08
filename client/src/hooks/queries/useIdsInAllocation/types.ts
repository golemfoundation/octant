import { UserAllocation } from 'hooks/queries/useUserAllocations';

export type OnAddRemoveAllocationElementLocalStorage = {
  allocations: number[];
  id: number;
  name: string;
  userAllocations?: UserAllocation[];
};
