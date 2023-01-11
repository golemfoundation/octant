import { formatUnits } from 'ethers/lib/utils';
import debounce from 'lodash/debounce';

import { TOAST_DEBOUNCE_TIME } from 'constants/toasts';
import { UserAllocation } from 'hooks/useUserAllocation';
import triggerToast from 'utils/triggerToast';

import { AllocationValues, AllocationValuesDefined } from './types';

export function getAllocationValuesInitialState(
  elements: number[],
  userAllocation?: UserAllocation,
): AllocationValues {
  return elements.reduce((acc, curr) => {
    const value =
      userAllocation?.proposalId === curr ? formatUnits(userAllocation?.allocation) : undefined;
    return {
      ...acc,
      [curr]: value,
    };
  }, {});
}

export function getAllocationsWithPositiveValues(
  elements: AllocationValues,
): AllocationValuesDefined {
  return Object.fromEntries(
    Object.entries(elements).filter(([_key, value]) => {
      const valueNumber = parseFloat(value);
      return valueNumber > 0;
    }),
  );
}

export const toastDebouncedOnlyOneItemAllowed = debounce(
  () =>
    triggerToast({
      message: 'Currently you can allocate to one project only.',
      title: 'Only one item allowed',
    }),
  TOAST_DEBOUNCE_TIME,
  { leading: true },
);

export const toastBudgetExceeding = debounce(
  () =>
    triggerToast({
      message: 'It is not allowed to allocate more than 100% of reward budget.',
      title: 'Exceeding 100%',
    }),
  TOAST_DEBOUNCE_TIME,
  { leading: true },
);
