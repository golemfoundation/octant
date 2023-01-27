import { ALLOCATION_ITEMS_KEY } from 'constants/localStorageKeys';
import triggerToast from 'utils/triggerToast';

import { toastDebouncedCantRemoveAllocatedProject } from './useIdsInAllocation/utils';
import { UserAllocation } from './useUserAllocations';

type OnAddRemoveAllocationElementLocalStorage = {
  allocations: number[];
  id: number;
  name: string;
  userAllocations?: UserAllocation[];
};

export function isProposalAlreadyAllocatedOn(
  userAllocations: undefined | UserAllocation[],
  id: number,
): boolean {
  // TODO Remove userAllocations.allocation.gt(0) check following https://wildlandio.atlassian.net/browse/HEX-108.
  if (!userAllocations) {
    return false;
  }
  const allocation = userAllocations.find(({ proposalId }) => proposalId === id);
  return !!allocation && allocation.allocation.gt(0);
}

export function onAddRemoveAllocationElementLocalStorage({
  allocations,
  id,
  userAllocations,
  name,
}: OnAddRemoveAllocationElementLocalStorage): number[] | undefined {
  if (isProposalAlreadyAllocatedOn(userAllocations, id)) {
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
