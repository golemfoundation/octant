import { applyMiddleware, createStore } from 'redux';

import { composeEnhancers } from './composeEnhancers';
import { initialState } from './initialState';
import rootReducer from './reducer';

const store = createStore(rootReducer, initialState, composeEnhancers(applyMiddleware()));

export type Dispatch = typeof store.dispatch;

export default store;
