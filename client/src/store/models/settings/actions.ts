import actionCreator from 'store/utils/actionCreator';

import { IsAllocateOnboardingAlwaysVisibleSetPayload } from './types';

const settingsPrefix = 'SETTINGS';

export const isAllocateOnboardingAlwaysVisibleSet =
  actionCreator<IsAllocateOnboardingAlwaysVisibleSetPayload>(
    settingsPrefix,
    'IS_ALLOCATION_ONBOARDING_ALWAYS_VISIBLE_SET',
  );

export const defaultValuesFromLocalStorageSet = actionCreator(
  settingsPrefix,
  'DEFAULT_VALUES_FROM_LOCAL_STORAGE_SET',
);
