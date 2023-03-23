import { createSelector } from 'reselect';

import { modelsSelector } from 'store/models/selectors';

export const settingsSelector = createSelector(modelsSelector, ({ settings }) => settings);

export const isAllocateOnboardingAlwaysVisibleSelector = createSelector(
  settingsSelector,
  ({ isAllocateOnboardingAlwaysVisible }) => isAllocateOnboardingAlwaysVisible,
);

export const isCryptoMainValueDisplaySelector = createSelector(
  settingsSelector,
  ({ isCryptoMainValueDisplay }) => isCryptoMainValueDisplay,
);

export const displayCurrencySelector = createSelector(
  settingsSelector,
  ({ displayCurrency }) => displayCurrency,
);
