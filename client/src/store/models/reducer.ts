import { combineReducers } from 'redux';

import { ModelsStore } from './types';
import allocationsReducer, { initialState as allocationsInitialState } from './allocations/reducer';

export const initialState = {
  allocations: allocationsInitialState,
};

const reducer = combineReducers<ModelsStore>({
  allocations: allocationsReducer,
});

export default reducer;
