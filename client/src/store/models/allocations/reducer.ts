import { createActions } from 'store/utils/createActions';

import { allocationAdd, allocationRemove, allocationsSet } from './actions';
import { AllocationsStore } from './types';

export const initialState: AllocationsStore = null;

const allocationsReducer = createActions<AllocationsStore>(
  handleActions => [
    handleActions(allocationsSet, (_state, { payload }) => payload),
    handleActions(allocationAdd, (state, { payload }) => [...state, payload]),
    handleActions(allocationRemove, (state, { payload }) => state.filter(id => id !== payload)),
  ],
  initialState,
);

export default allocationsReducer;
