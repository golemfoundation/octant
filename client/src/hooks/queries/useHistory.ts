/* eslint-disable no-param-reassign */
import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useAccount } from 'wagmi';

import { apiGetHistory, Response, HistoryItem as HistoryItemResponse } from 'api/calls/history';
import { QUERY_KEYS } from 'api/queryKeys';

type HistoryItemString = HistoryItemResponse & {
  projectsNumber?: number;
};

export type HistoryItem = Omit<HistoryItemString, 'amount'> & {
  amount: BigNumber;
};

export default function useHistory(
  options?: UseQueryOptions<Response, unknown, HistoryItem[], any>,
): UseQueryResult<HistoryItem[] | undefined> {
  const { address } = useAccount();

  return useQuery<Response, any, HistoryItem[], any>(
    QUERY_KEYS.history,
    () => apiGetHistory(address as string),
    {
      enabled: !!address,
      select: ({ history }) =>
        history
          .reduce<HistoryItemString[]>((acc1, curr) => {
            if (curr.type === 'allocation') {
              const elIdx = acc1.findIndex(
                val => val.type === 'allocation' && val.timestamp === curr.timestamp,
              );

              if (elIdx > -1) {
                acc1[elIdx].amount = `${
                  parseInt(acc1[elIdx].amount, 10) + parseInt(curr.amount, 10)
                }`;
                acc1[elIdx].projectsNumber = (acc1[elIdx].projectsNumber as number) + 1;
                return acc1;
              }
              // eslint-disable-next-line dot-notation
              curr['projectsNumber'] = 1;
            }

            acc1.push(curr);
            return acc1;
          }, [])
          .map<HistoryItem>(({ amount, ...rest }) => ({
            amount: parseUnits(amount, 'wei'),
            ...rest,
          })),
      ...options,
    },
  );
}
