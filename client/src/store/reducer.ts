import { combineReducers } from 'redux';

import { RootStore } from './types';
import modelsReducer from './models/reducer';

const rootReducer = combineReducers<RootStore>({
  models: modelsReducer,
});

export default rootReducer;
