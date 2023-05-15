/* eslint-disable @typescript-eslint/naming-convention */
import { Query } from '@tanstack/react-query';

import { QUERY_KEYS } from 'api/queryKeys';
import i18n from 'i18n';
import triggerToast from 'utils/triggerToast';

import { ErrorsConfig, Error } from './types';

const errors: ErrorsConfig = {
  'HN:Allocations/allocate-above-rewards-budget': {
    message: i18n.t('api.errorMessage.allocations.allocateAboveRewardsBudget'),
    type: 'toast',
  },
  'HN:Allocations/decision-window-closed': {
    message: i18n.t('api.errorMessage.allocations.decisionWindowClosed'),
    type: 'toast',
  },
  'HN:Allocations/not-started-yet': {
    message: i18n.t('api.errorMessage.allocations.notStartedYet'),
    type: 'toast',
  },
  'HN:Deposits/cannot-transfer-from-sender': {
    message: i18n.t('api.errorMessage.deposits.cannotTransferFromSender'),
    type: 'toast',
  },
  'HN:Deposits/deposit-is-smaller': {
    message: i18n.t('api.errorMessage.deposits.depositIsSmaller'),
    type: 'inline',
  },
  'History/loading-encountered-an-error': {
    message: i18n.t('api.errorMessage.history.loadingEncounteredAnError'),
    type: 'toast',
  },
  'user rejected transaction': {
    message: i18n.t('api.errorMessage.userRejectedTransaction'),
    type: 'toast',
  },
};

function getError(reason: string): Error {
  const error = errors[reason];
  if (error) {
    return error;
  }
  return {
    message: i18n.t('api.errorMessage.default'),
    type: 'toast',
  };
}

export function handleError(reason: string, query?: Query | unknown): string | undefined {
  // @ts-expect-error mutations do not have queryKey field, they are pure value and are unknown.
  if (query && query.queryKey?.find(element => element === QUERY_KEYS.cryptoValuesRoot[0])) {
    // Graceful failure, no notification, no error. Inline info shown in places for values.
    return;
  }

  const { message, type } = getError(reason);
  if (type === 'toast') {
    triggerToast({ message, type: 'error' });
    return;
  }
  return message;
}
