import { ALLOCATION_ITEMS_KEY } from 'constants/localStorageKeys';
import triggerToast from 'utils/triggerToast';

import { UserAllocation } from './useUserAllocation';
import { toastDebouncedCantRemoveAllocatedProject } from './useIdsInAllocation/utils';

type OnAddRemoveAllocationElementLocalStorage = {
  allocations: number[];
  id: number;
  name: string;
  userAllocation?: UserAllocation;
};

export function isProposalAlreadyAllocatedOn(
  userAllocation: undefined | UserAllocation,
  id: number,
): boolean {
  // TODO Remove userAllocation.allocation.gt(0) check following https://wildlandio.atlassian.net/browse/HEX-108.
  return !!userAllocation && userAllocation.proposalId === id && userAllocation.allocation.gt(0);
}

export function onAddRemoveAllocationElementLocalStorage({
  allocations,
  id,
  userAllocation,
  name,
}: OnAddRemoveAllocationElementLocalStorage): number[] | undefined {
  if (
    isProposalAlreadyAllocatedOn(userAllocation, id) &&
    allocations.includes(userAllocation!.proposalId)
  ) {
    toastDebouncedCantRemoveAllocatedProject();
    return;
  }
  const isItemAlreadyAdded = allocations.includes(id);
  const newIds = allocations ? [...allocations] : [];

  if (isItemAlreadyAdded) {
    newIds.splice(newIds.indexOf(id), 1);
    triggerToast({
      title: 'Removed from Allocate',
    });
  } else {
    newIds.push(id);
    triggerToast({
      title: `Added ${name} to Allocate`,
    });
  }

  localStorage.setItem(ALLOCATION_ITEMS_KEY, JSON.stringify(newIds));

  return newIds;
}
