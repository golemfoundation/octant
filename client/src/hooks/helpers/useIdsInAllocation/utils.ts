import debounce from 'lodash/debounce';

import { TOAST_DEBOUNCE_TIME } from 'constants/toasts';
import { UserAllocationElement } from 'hooks/queries/useUserAllocations';
import i18n from 'i18n';
import triggerToast from 'utils/triggerToast';

import { OnAddRemoveAllocationElementLocalStorage } from './types';

export const toastDebouncedCantRemoveAllocatedProject = debounce(
  () =>
    triggerToast({
      message: i18n.t('toasts.cantRemoveProjectWithDonations.message'),
      title: i18n.t('toasts.cantRemoveProjectWithDonations.title'),
      type: 'warning',
    }),
  TOAST_DEBOUNCE_TIME,
  { leading: true },
);

export function isProposalAlreadyAllocatedOn(
  userAllocationsElements: undefined | UserAllocationElement[],
  address: string,
): boolean {
  // TODO Remove userAllocations.allocation.gt(0) check following https://wildlandio.atlassian.net/browse/HEX-108.
  if (!userAllocationsElements) {
    return false;
  }
  const allocation = userAllocationsElements.find(
    ({ address: userAllocationAddress }) => userAllocationAddress === address,
  );
  return !!allocation && allocation.value.gt(0);
}

export function onAddRemoveAllocationElementLocalStorage({
  allocations,
  address,
  userAllocationsElements,
}: OnAddRemoveAllocationElementLocalStorage): string[] | undefined {
  if (isProposalAlreadyAllocatedOn(userAllocationsElements, address)) {
    toastDebouncedCantRemoveAllocatedProject();
    return;
  }
  const isItemAlreadyAdded = allocations.includes(address);
  const newIds = allocations ? [...allocations] : [];

  if (isItemAlreadyAdded) {
    newIds.splice(newIds.indexOf(address), 1);
  } else {
    newIds.push(address);
  }

  return newIds;
}
