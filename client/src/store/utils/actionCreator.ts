import { PayloadActionCreator, createAction } from '@reduxjs/toolkit';

import { REQUEST_ACTIONS_SPACER } from 'constants/store';

/**
 * Creates typed action with given prefix and type of suffix for request.
 *
 * @param actionNamePrefix - prefix for action to be used
 * @param actionNameSuffix - suffix for action to be used
 *
 * @returns action for request.
 */
export default function actionCreator<Type = undefined>(
  actionNamePrefix: string,
  actionNameSuffix?: string,
): PayloadActionCreator<Type> {
  if (actionNameSuffix) {
    return createAction<Type>(`${actionNamePrefix}${REQUEST_ACTIONS_SPACER}${actionNameSuffix}`);
  }
  return createAction<Type>(actionNamePrefix);
}
