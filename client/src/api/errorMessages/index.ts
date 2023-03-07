/* eslint-disable @typescript-eslint/naming-convention */

import triggerToast from 'utils/triggerToast';

import { ErrorsConfig, Error } from './types';

const errors: ErrorsConfig = {
  'HN:Allocations/allocate-above-rewards-budget': {
    message:
      "You don't have that much in your rewards budget. Please try again when you have earned some more rewards.",
    type: 'toast',
  },
  'HN:Allocations/decision-window-closed': {
    message: 'The allocation period is not open at the moment. Please try again later.',
    type: 'toast',
  },
  'HN:Allocations/not-started-yet': {
    message: "The epoch hasn't started yet. Please try again later.",
    type: 'toast',
  },
  'HN:Deposits/cannot-transfer-from-sender': {
    message:
      'Something went wrong with the GLM transfer, but your funds are safe. Please try again.',
    type: 'toast',
  },
  'HN:Deposits/deposit-is-smaller': {
    message: 'Not enough funds.',
    type: 'inline',
  },
  'History/loading-encountered-an-error': {
    message: 'Loading of history of operations encountered a problem. Please try again.',
    type: 'toast',
  },
  'user rejected transaction': {
    message: 'User rejected transaction.',
    type: 'toast',
  },
};

function getError(reason: string): Error {
  const error = errors[reason];
  if (error) {
    return error;
  }
  return {
    message: 'Oops, something went wrong there. Please reload the app and try again.',
    type: 'toast',
  };
}

export function handleError(reason: string): string | undefined {
  const { message, type } = getError(reason);
  if (type === 'toast') {
    triggerToast({ message, type: 'error' });
    return;
  }
  return message;
}
