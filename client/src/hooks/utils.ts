import { ALLOCATION_ITEMS_KEY } from 'constants/localStorageKeys';

export function onAddRemoveAllocationElementLocalStorage(
  idsInAllocation: undefined | number[],
  id: number,
): number[] {
  const isItemAlreadyAdded = idsInAllocation?.includes(id);
  const newIds = idsInAllocation ? [...idsInAllocation] : [];

  if (isItemAlreadyAdded) {
    newIds.splice(newIds.indexOf(id), 1);
  } else {
    newIds.push(id);
  }

  localStorage.setItem(ALLOCATION_ITEMS_KEY, JSON.stringify(newIds));

  return newIds;
}
