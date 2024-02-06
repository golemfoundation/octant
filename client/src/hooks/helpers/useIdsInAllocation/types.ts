import { UserAllocationElement } from 'hooks/queries/useUserAllocations';
import { AllocationsData } from 'store/allocations/types';

export type GetShouldProjectBeAddedOrRemovedFromAllocation = {
  address: string;
  allocations: AllocationsData['allocations'];
  userAllocationsElements?: UserAllocationElement[];
};
