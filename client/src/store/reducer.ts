import { combineReducers } from 'redux';

import modelsReducer from './models/reducer';
import { RootStore } from './types';

const rootReducer = combineReducers<RootStore>({
  models: modelsReducer,
});

export default rootReducer;
