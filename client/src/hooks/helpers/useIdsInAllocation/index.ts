import { UserAllocationElement } from 'hooks/queries/useUserAllocations';
import { AllocationsData, AllocationsMethods } from 'store/allocations/types';

import { getShouldProjectBeAddedOrRemovedFromAllocation } from './utils';

export default function useIdsInAllocation({
  allocations,
  userAllocationsElements,
  addAllocations,
  removeAllocations,
}: {
  addAllocations: AllocationsMethods['addAllocations'];
  allocations: AllocationsData['allocations'];
  removeAllocations: AllocationsMethods['removeAllocations'];
  userAllocationsElements: UserAllocationElement[] | undefined;
}): { onAddRemoveFromAllocate: (address: string, newAllocations?: string[]) => void } {
  const onAddRemoveFromAllocate = (address: string, newAllocations = allocations) => {
    const decision = getShouldProjectBeAddedOrRemovedFromAllocation({
      address,
      allocations: newAllocations,
      userAllocationsElements,
    });

    if (decision === 'add') {
      addAllocations([address]);
    } else {
      removeAllocations([address]);
    }
  };

  return { onAddRemoveFromAllocate };
}
