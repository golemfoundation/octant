import debounce from 'lodash/debounce';

import { TOAST_DEBOUNCE_TIME } from 'constants/toasts';
import { UserAllocation } from 'hooks/queries/useUserAllocations';
import triggerToast from 'utils/triggerToast';

import { OnAddRemoveAllocationElementLocalStorage } from './types';

export const toastDebouncedCantRemoveAllocatedProject = debounce(
  () =>
    triggerToast({
      message:
        'If you want to remove a project from the Allocate view, you need to unallocate funds from it first.',
      title: 'You allocated to this project',
      type: 'warning',
    }),
  TOAST_DEBOUNCE_TIME,
  { leading: true },
);

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

  return newIds;
}
