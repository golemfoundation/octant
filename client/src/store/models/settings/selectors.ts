import { createSelector } from 'reselect';

import { modelsSelector } from 'store/models/selectors';

export const settingsSelector = createSelector(modelsSelector, ({ settings }) => settings);

export const isAllocateOnboardingAlwaysVisibleSelector = createSelector(
  settingsSelector,
  ({ isAllocateOnboardingAlwaysVisible }) => isAllocateOnboardingAlwaysVisible,
);
