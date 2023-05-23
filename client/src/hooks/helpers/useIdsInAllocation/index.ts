import { UserAllocation } from 'hooks/queries/useUserAllocations';
import { AllocationsData, AllocationsMethods } from 'store/allocations/types';

import { onAddRemoveAllocationElementLocalStorage } from './utils';

export default function useIdsInAllocation({
  allocations,
  proposalName,
  userAllocations,
  setAllocations,
}: {
  allocations: AllocationsData['allocations'];
  proposalName?: string;
  setAllocations: AllocationsMethods['setAllocations'];
  userAllocations?: UserAllocation[];
}): { onAddRemoveFromAllocate: (address: string) => void } {
  const onAddRemoveFromAllocate = (address: string) => {
    const newIds = onAddRemoveAllocationElementLocalStorage({
      address,
      allocations,
      name: proposalName,
      userAllocations,
    });
    if (newIds) {
      setAllocations(newIds);
    }
  };

  return { onAddRemoveFromAllocate };
}
