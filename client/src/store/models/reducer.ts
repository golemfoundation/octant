import { combineReducers } from 'redux';

import allocationsReducer, { initialState as allocationsInitialState } from './allocations/reducer';
import onboardingReducer, { initialState as onboardingInitialState } from './onboarding/reducer';
import settingsReducer, { initialState as settingsInitialState } from './settings/reducer';
import { ModelsStore } from './types';

export const initialState = {
  allocations: allocationsInitialState,
  onboarding: onboardingInitialState,
  settings: settingsInitialState,
};

const reducer = combineReducers<ModelsStore>({
  allocations: allocationsReducer,
  onboarding: onboardingReducer,
  settings: settingsReducer,
});

export default reducer;
