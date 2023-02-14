import actionCreator from 'store/utils/actionCreator';

import { IsOnboardingDonePayload } from './types';

const onboardingPrefix = 'ONBOARDING';

export const setIsOnboardingDone = actionCreator<IsOnboardingDonePayload>(
  onboardingPrefix,
  'IS_ONBOARDING_DONE_SET',
);

export const defaultValuesFromLocalStorageSet = actionCreator(
  onboardingPrefix,
  'DEFAULT_VALUES_FROM_LOCAL_STORAGE_SET',
);
