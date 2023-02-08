import { formatUnits } from 'ethers/lib/utils';
import debounce from 'lodash/debounce';

import { TOAST_DEBOUNCE_TIME } from 'constants/toasts';
import { UserAllocation } from 'hooks/queries/useUserAllocations';
import triggerToast from 'utils/triggerToast';

import { AllocationValues, AllocationWithPositiveValue } from './types';

export function getAllocationValuesInitialState(
  elements: number[],
  userAllocations?: UserAllocation[],
): AllocationValues {
  return elements.reduce((acc, curr) => {
    const allocation = userAllocations?.find(({ proposalId }) => proposalId === curr);
    const value = allocation ? formatUnits(allocation.allocation) : undefined;
    return {
      ...acc,
      [curr]: value,
    };
  }, {});
}

export function getAllocationsWithPositiveValues(
  elements: AllocationValues,
): AllocationWithPositiveValue[] {
  return Object.keys(elements).reduce<AllocationWithPositiveValue[]>((acc, key) => {
    const value = elements[key];
    const valueNumber = parseFloat(value);
    const newElement: AllocationWithPositiveValue = {
      proposalId: parseInt(key, 10),
      value,
    };
    return valueNumber > 0 ? [...acc, newElement] : acc;
  }, []);
}

export const toastBudgetExceeding = debounce(
  () =>
    triggerToast({
      message: 'It is not allowed to allocate more than 100% of reward budget.',
      title: 'Exceeding 100%',
      type: 'warning',
    }),
  TOAST_DEBOUNCE_TIME,
  { leading: true },
);
