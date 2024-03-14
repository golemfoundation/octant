import { UserAllocationElement } from 'hooks/queries/useUserAllocations';
import i18n from 'i18n';
import toastService from 'services/toastService';

import { GetShouldProjectBeAddedOrRemovedFromAllocation } from './types';

export function isProjectAlreadyAllocatedOn(
  userAllocationsElements: undefined | UserAllocationElement[],
  address: string,
): boolean {
  if (!userAllocationsElements) {
    return false;
  }
  const userAllocationsElement = userAllocationsElements.find(
    ({ address: userAllocationAddress }) => userAllocationAddress === address,
  );
  return !!userAllocationsElement && userAllocationsElement.value > 0n;
}

export function getShouldProjectBeAddedOrRemovedFromAllocation({
  allocations,
  address,
  userAllocationsElements,
  isDecisionWindowOpen,
}: GetShouldProjectBeAddedOrRemovedFromAllocation): 'add' | 'remove' {
  const userAllocationsAddresses = userAllocationsElements?.map(element => element.address);
  const isItemAlreadyAdded = allocations.includes(address);
  const newIds = allocations ? [...allocations] : [];

  if (isItemAlreadyAdded) {
    // Outside AW past allocations do not count.
    if (isDecisionWindowOpen && isProjectAlreadyAllocatedOn(userAllocationsElements, address)) {
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
    // Outside AW past allocations do not count.
    isDecisionWindowOpen &&
    userAllocationsAddresses &&
    userAllocationsAddresses.every(element => newIds.includes(element))
  ) {
    toastService.hideToast('confirmChanges');
  }

  return 'add';
}
