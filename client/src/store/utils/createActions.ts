import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { Reducer } from 'redux';
import { ReducerMapValue, handleActions } from 'redux-actions';

type HandleAction<State> = <Payload>(
  actionCreator: ActionCreatorWithPayload<Payload>,
  reducer: ReducerMapValue<State, Parameters<typeof actionCreator>[0]>,
) => { [k: string]: ReducerMapValue<State, any> };

const handleAction =
  <T>(): HandleAction<T> =>
  (actionCreator, reducer) => ({
    [actionCreator.type]: reducer,
  });

export const createActions = <State>(
  reducerCreators: (handler: HandleAction<State>) => ReturnType<HandleAction<State>>[],
  initialState: State,
): Reducer<State, any> =>
  handleActions<State, any>(
    reducerCreators(handleAction<State>()).reduce(
      (previous, current) => ({
        ...previous,
        ...current,
      }),
      {},
    ),
    initialState,
  );
