import { UserAllocationElement } from 'hooks/queries/useUserAllocations';
import { AllocationsData, AllocationsMethods } from 'store/allocations/types';

import { onAddRemoveAllocationElementLocalStorage } from './utils';

export default function useIdsInAllocation({
  allocations,
  userAllocationsElements,
  setAllocations,
}: {
  allocations: AllocationsData['allocations'];
  setAllocations: AllocationsMethods['setAllocations'];
  userAllocationsElements: UserAllocationElement[] | undefined;
}): { onAddRemoveFromAllocate: (address: string) => void } {
  const onAddRemoveFromAllocate = (address: string) => {
    const newIds = onAddRemoveAllocationElementLocalStorage({
      address,
      allocations,
      userAllocationsElements,
    });
    if (newIds) {
      setAllocations(newIds);
    }
  };

  return { onAddRemoveFromAllocate };
}
