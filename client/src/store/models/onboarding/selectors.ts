import { createSelector } from 'reselect';

import { modelsSelector } from 'store/models/selectors';

export const onboardingSelector = createSelector(modelsSelector, ({ onboarding }) => onboarding);

export const isOnboardingDoneSelector = createSelector(
  onboardingSelector,
  ({ isOnboardingDone }) => isOnboardingDone,
);
