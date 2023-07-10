import { UserAllocationElement } from 'hooks/queries/useUserAllocations';
import { AllocationsData, AllocationsMethods } from 'store/allocations/types';

import { onAddRemoveAllocationElementLocalStorage } from './utils';

export default function useIdsInAllocation({
  allocations,
  proposalName,
  userAllocationsElements,
  setAllocations,
}: {
  allocations: AllocationsData['allocations'];
  proposalName?: string;
  setAllocations: AllocationsMethods['setAllocations'];
  userAllocationsElements: UserAllocationElement[];
}): { onAddRemoveFromAllocate: (address: string) => void } {
  const onAddRemoveFromAllocate = (address: string) => {
    const newIds = onAddRemoveAllocationElementLocalStorage({
      address,
      allocations,
      name: proposalName,
      userAllocationsElements,
    });
    if (newIds) {
      setAllocations(newIds);
    }
  };

  return { onAddRemoveFromAllocate };
}
