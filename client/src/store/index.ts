import { applyMiddleware, createStore } from 'redux';

import localStorageService from 'services/localStorageService';

import { composeEnhancers } from './composeEnhancers';
import { initialState } from './initialState';
import localStorageSaverMiddleware from './middlewares/localStorage';
import rootReducer from './reducer';

localStorageService.init();

const store = createStore(
  rootReducer,
  initialState,
  composeEnhancers(applyMiddleware(localStorageSaverMiddleware)),
);

export type Dispatch = typeof store.dispatch;

export default store;
