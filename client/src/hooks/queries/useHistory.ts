/* eslint-disable no-param-reassign */
import {
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useAccount } from 'wagmi';

import { apiGetHistory, Response, ResponseHistoryItem } from 'api/calls/history';
import { QUERY_KEYS } from 'api/queryKeys';

export type ResponseHistoryItemWithProjectsNumber = ResponseHistoryItem & {
  projectsNumber?: number;
};

export interface HistoryItemProps extends Omit<ResponseHistoryItemWithProjectsNumber, 'amount'> {
  amount: BigNumber;
}

export default function useHistory(
  options?: UseInfiniteQueryOptions<Response, unknown, Response, any>,
): UseInfiniteQueryResult<Response> & { history: HistoryItemProps[] } {
  const { address } = useAccount();

  const query = useInfiniteQuery({
    enabled: !!address,
    getNextPageParam: lastPage => lastPage.next_cursor,
    queryFn: ({ pageParam = '' }) => apiGetHistory(address as string, pageParam),
    queryKey: QUERY_KEYS.history,

    staleTime: Infinity,
    ...options,
  });

  const historyFromPages: ResponseHistoryItem[] =
    query.data?.pages.reduce<any[]>((acc, curr) => [...acc, ...curr.history], []) || [];

  const history = historyFromPages
    .reduce<ResponseHistoryItemWithProjectsNumber[]>((acc1, curr) => {
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
    }, [])
    .map<HistoryItemProps>(({ amount, ...rest }) => ({
      amount: parseUnits(amount, 'wei'),
      ...rest,
    }));

  return {
    ...query,
    history,
  };
}
