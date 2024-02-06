import { UserAllocationElement } from 'hooks/queries/useUserAllocations';
import i18n from 'i18n';
import toastService from 'services/toastService';

import { GetShouldProjectBeAddedOrRemovedFromAllocation } from './types';

export function isProposalAlreadyAllocatedOn(
  userAllocationsElements: undefined | UserAllocationElement[],
  address: string,
): boolean {
  if (!userAllocationsElements) {
    return false;
  }
  const userAllocationsElement = userAllocationsElements.find(
    ({ address: userAllocationAddress }) => userAllocationAddress === address,
  );
  return !!userAllocationsElement && userAllocationsElement.value.gt(0);
}

export function getShouldProjectBeAddedOrRemovedFromAllocation({
  allocations,
  address,
  userAllocationsElements,
}: GetShouldProjectBeAddedOrRemovedFromAllocation): 'add' | 'remove' {
  const userAllocationsAddresses = userAllocationsElements?.map(element => element.address);
  const isItemAlreadyAdded = allocations.includes(address);
  const newIds = allocations ? [...allocations] : [];

  if (isItemAlreadyAdded) {
    if (isProposalAlreadyAllocatedOn(userAllocationsElements, address)) {
      toastService.showToast({
        message: i18n.t('toasts.confirmChanges.title'),
        name: 'confirmChanges',
        type: 'warning',
      });
    }

    newIds.splice(newIds.indexOf(address), 1);
    return 'remove';
  }

  newIds.push(address);

  // When newIds include all elements of userAllocationsAddresses, hideToast.
  if (
    userAllocationsAddresses &&
    userAllocationsAddresses.every(element => newIds.includes(element))
  ) {
    toastService.hideToast('confirmChanges');
  }

  return 'add';
}
