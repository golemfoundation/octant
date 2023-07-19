/* eslint-disable no-param-reassign */
import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiGetHistory, Response } from 'api/calls/history';
import { QUERY_KEYS } from 'api/queryKeys';

export type HistoryItem = {
  // BigNumber (wei) string
  amount: string;
  projectsNumber?: number;
  timestamp: string;
  type: 'lock' | 'unlock' | 'allocation' | 'withdrawal';
};

type HistoryItems = HistoryItem[];

export default function useHistory(
  options?: UseQueryOptions<Response, unknown, Response['history'], any>,
): UseQueryResult<HistoryItems> {
  const { address } = useAccount();

  return useQuery(QUERY_KEYS.history, () => apiGetHistory(address as string), {
    enabled: !!address,
    select: ({ history }) =>
      history.reduce((acc1, curr) => {
        if (curr.type === 'allocation') {
          const elIdx = acc1.findIndex(
            val => val.type === 'allocation' && val.timestamp === curr.timestamp,
          );

          if (elIdx > -1) {
            acc1[elIdx].amount = `${parseInt(acc1[elIdx].amount, 10) + parseInt(curr.amount, 10)}`;
            acc1[elIdx].projectsNumber = (acc1[elIdx].projectsNumber as number) + 1;
            return acc1;
          }
          // eslint-disable-next-line dot-notation
          curr['projectsNumber'] = 1;
        }

        acc1.push(curr);
        return acc1;
      }, [] as HistoryItems),
    ...options,
  });
}
