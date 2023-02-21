import { UserAllocation } from 'hooks/queries/useUserAllocations';
import { AllocationsStore } from 'store/models/allocations/types';

export type OnAddRemoveAllocationElementLocalStorage = {
  address: string;
  allocations: NonNullable<AllocationsStore>;
  name: string;
  userAllocations?: UserAllocation[];
};
