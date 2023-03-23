import actionCreator from 'store/utils/actionCreator';

import {
  IsAllocateOnboardingAlwaysVisibleSetPayload,
  DisplayCurrencySetPayload,
  isCryptoMainValueDisplaySetPayload,
} from './types';

const settingsPrefix = 'SETTINGS';

export const isCryptoMainValueDisplaySet = actionCreator<isCryptoMainValueDisplaySetPayload>(
  settingsPrefix,
  'IS_CRYPTO_MAIN_VALUE_DISPLAY_SET',
);

export const isAllocateOnboardingAlwaysVisibleSet =
  actionCreator<IsAllocateOnboardingAlwaysVisibleSetPayload>(
    settingsPrefix,
    'IS_ALLOCATION_ONBOARDING_ALWAYS_VISIBLE_SET',
  );

export const defaultValuesFromLocalStorageSet = actionCreator(
  settingsPrefix,
  'DEFAULT_VALUES_FROM_LOCAL_STORAGE_SET',
);

export const displayCurrencySet = actionCreator<DisplayCurrencySetPayload>(
  settingsPrefix,
  'DISPLAY_CURRENCY_SET',
);
