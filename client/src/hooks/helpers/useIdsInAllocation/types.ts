import { UserAllocation } from 'hooks/queries/useUserAllocations';
import { AllocationsData } from 'store/allocations/types';

export type OnAddRemoveAllocationElementLocalStorage = {
  address: string;
  allocations: NonNullable<AllocationsData>;
  name: string;
  userAllocations?: UserAllocation[];
};
