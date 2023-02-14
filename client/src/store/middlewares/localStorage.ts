import { MiddlewareAPI, Store } from 'redux';

import {
  ALLOCATION_ITEMS_KEY,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'constants/localStorageKeys';
import { allocationsSet } from 'store/models/allocations/actions';
import { setIsOnboardingDone } from 'store/models/onboarding/actions';
import { isAllocateOnboardingAlwaysVisibleSet } from 'store/models/settings/actions';
import { ActionWithPayload } from 'types/actions';

import { AllocationToSaveToLocalStorage } from './types';

const actionsToSaveToLocalStorage: AllocationToSaveToLocalStorage[] = [
  {
    localStorageKey: ALLOCATION_ITEMS_KEY,
    type: allocationsSet.type,
  },
  {
    localStorageKey: IS_ONBOARDING_DONE,
    type: setIsOnboardingDone.type,
  },
  {
    localStorageKey: IS_ONBOARDING_ALWAYS_VISIBLE,
    type: isAllocateOnboardingAlwaysVisibleSet.type,
  },
];

const localStorageSaverMiddleware =
  (_store: MiddlewareAPI<any>) =>
  (next: (action) => Store) =>
  (action: ActionWithPayload<unknown>): Store => {
    const actionToSave = actionsToSaveToLocalStorage.find(({ type }) => type === action.type);

    if (actionToSave) {
      localStorage.setItem(actionToSave.localStorageKey, JSON.stringify(action.payload));
    }

    return next(action);
  };

export default localStorageSaverMiddleware;
