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
  address: string,
): boolean {
  // TODO Remove userAllocations.allocation.gt(0) check following https://wildlandio.atlassian.net/browse/HEX-108.
  if (!userAllocations) {
    return false;
  }
  const allocation = userAllocations.find(({ proposalAddress }) => proposalAddress === address);
  return !!allocation && allocation.allocation.gt(0);
}

export function onAddRemoveAllocationElementLocalStorage({
  allocations,
  address,
  userAllocations,
  name,
}: OnAddRemoveAllocationElementLocalStorage): string[] | undefined {
  if (isProposalAlreadyAllocatedOn(userAllocations, address)) {
    toastDebouncedCantRemoveAllocatedProject();
    return;
  }
  const isItemAlreadyAdded = allocations.includes(address);
  const newIds = allocations ? [...allocations] : [];

  if (isItemAlreadyAdded) {
    newIds.splice(newIds.indexOf(address), 1);
    triggerToast({
      dataTest: 'Toast--removeFromAllocate',
      title: `Removed ${name} from Allocate`,
    });
  } else {
    newIds.push(address);
    triggerToast({
      dataTest: 'Toast--addToAllocate',
      title: `Added ${name} to Allocate`,
    });
  }

  return newIds;
}
