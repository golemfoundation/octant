/* eslint-disable import/no-unresolved */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { ActionType } from '@redux-saga/types';

export interface AnyAction {
  [key: string]: any;
  type: ActionType;
}
