import { createActions } from 'store/utils/createActions';

import { AllocationsStore } from './types';
import { allocationAdd, allocationRemove, allocationsAdd } from './actions';

export const initialState: AllocationsStore = null;

const allocationsReducer = createActions<AllocationsStore>(
  handleActions => [
    handleActions(allocationsAdd, (_state, { payload }) => payload),
    handleActions(allocationAdd, (state, { payload }) => [...state, payload]),
    handleActions(allocationRemove, (state, { payload }) => state.filter(id => id !== payload)),
  ],
  initialState,
);

export default allocationsReducer;
