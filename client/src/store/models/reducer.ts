import { combineReducers } from 'redux';

import allocationsReducer, { initialState as allocationsInitialState } from './allocations/reducer';
import { ModelsStore } from './types';

export const initialState = {
  allocations: allocationsInitialState,
};

const reducer = combineReducers<ModelsStore>({
  allocations: allocationsReducer,
});

export default reducer;
