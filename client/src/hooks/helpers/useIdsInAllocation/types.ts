import { UserAllocation } from 'hooks/queries/useUserAllocations';
import { AllocationsData } from 'store/allocations/types';

export type OnAddRemoveAllocationElementLocalStorage = {
  address: string;
  allocations: AllocationsData['allocations'];
  name?: string;
  userAllocations?: UserAllocation[];
};
