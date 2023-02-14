import { Action } from 'redux';

export interface ActionWithPayload<PayloadType> extends Action {
  payload: PayloadType;
}
