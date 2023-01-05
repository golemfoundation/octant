import debounce from 'lodash/debounce';

import { TOAST_DEBOUNCE_TIME } from 'constants/toasts';
import { UserVote } from 'hooks/useUserVote';
import triggerToast from 'utils/triggerToast';

import { AllocationValues, AllocationValuesDefined } from './types';

export function getAllocationValuesInitialState(
  elements: number[],
  userVote?: UserVote,
): AllocationValues {
  return elements.reduce((acc, curr) => {
    const value = userVote?.proposalId === curr ? userVote?.alpha : undefined;
    return {
      ...acc,
      [curr]: value,
    };
  }, {});
}

export function getAllocationsWithPositiveValues(
  elements: AllocationValues,
): AllocationValuesDefined {
  return Object.fromEntries(Object.entries(elements).filter(([_key, value]) => value > 0));
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
