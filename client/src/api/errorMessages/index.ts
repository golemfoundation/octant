/* eslint-disable @typescript-eslint/naming-convention */
import { Query } from '@tanstack/react-query';

import { QUERY_KEYS, ROOTS } from 'api/queryKeys';
import i18n from 'i18n';
import toastService from 'services/toastService';

import { QueryMutationError, QueryMutationErrorConfig, IgnoredQueries } from './types';

const IGNORED_QUERIES: IgnoredQueries = [
  ROOTS.cryptoValues,
  ROOTS.individualReward,
  ROOTS.projectsIpfsResults,
  QUERY_KEYS.withdrawals,
];

const errors: QueryMutationErrorConfig = {
  4001: {
    message: i18n.t('api.errorMessage.userRejectedWalletOperation'),
    type: 'toast',
  },
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
};

function getError(reason: string): QueryMutationError {
  const error = errors[reason];
  if (error) {
    return error;
  }
  return {
    message: i18n.t('api.errorMessage.default.message'),
    title: i18n.t('api.errorMessage.default.title'),
    type: 'toast',
  };
}

export function handleError(reason: string, query?: Query | unknown): string | undefined {
  // @ts-expect-error mutations do not have queryKey field, they are pure value and are unknown.
  if (query && query.queryKey?.find(element => IGNORED_QUERIES.includes(element))) {
    // No notification. Either graceful failure, or local handling.
    return;
  }

  const { message, title, type } = getError(reason);
  if (type === 'toast') {
    toastService.showToast({ message, name: 'backendError', title, type: 'error' });
    return;
  }
  return message;
}
