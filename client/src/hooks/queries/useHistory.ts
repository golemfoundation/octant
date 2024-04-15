/* eslint-disable no-param-reassign */
import {
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiGetHistory, Response, ResponseHistoryItem } from 'api/calls/history';
import { QUERY_KEYS } from 'api/queryKeys';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

export type ResponseHistoryItemWithProjectsNumber = ResponseHistoryItem & {
  projects?: {
    address: string;
    amount: bigint;
  }[];
  projectsNumber?: number;
};

export interface HistoryElement extends Omit<ResponseHistoryItemWithProjectsNumber, 'amount'> {
  amount: bigint;
}

export default function useHistory(
  options?: UseInfiniteQueryOptions<Response, unknown, Response, any>,
): UseInfiniteQueryResult<Response, unknown> & { history: HistoryElement[] } {
  const { address } = useAccount();

  const query = useInfiniteQuery({
    enabled: !!address,
    getNextPageParam: lastPage => lastPage.nextCursor,
    initialPageParam: '',
    queryFn: ({ pageParam }) => apiGetHistory(address as string, pageParam),
    queryKey: QUERY_KEYS.history,
    staleTime: Infinity,
    ...options,
  });

  const historyFromPages: ResponseHistoryItem[] =
    (query.data as any)?.pages.reduce((acc, curr) => [...acc, ...curr.history], []) || [];

  const history = historyFromPages
    .map<HistoryElement>(({ amount, ...rest }) => ({
      amount: parseUnitsBigInt(amount, 'wei'),
      ...rest,
    }))
    .reduce<HistoryElement[]>((acc1, curr) => {
      if (curr.type === 'allocation') {
        const elIdx = acc1.findIndex(
          val => val.type === 'allocation' && val.timestamp === curr.timestamp,
        );

        if (elIdx > -1) {
          // eslint-disable-next-line operator-assignment
          acc1[elIdx].amount = acc1[elIdx].amount + curr.amount;
          acc1[elIdx].projectsNumber = (acc1[elIdx].projectsNumber as number) + 1;
          // @ts-expect-error This property will be defined already, as per logic after the if.
          acc1[elIdx].projects.push({
            address: curr.projectAddress!,
            amount: curr.amount,
          });
          return acc1;
        }
        // eslint-disable-next-line dot-notation
        curr['projectsNumber'] = 1;
        // eslint-disable-next-line dot-notation
        curr['projects'] = [
          {
            address: curr.projectAddress!,
            amount: curr.amount,
          },
        ];
      }
      acc1.push(curr);
      return acc1;
    }, []);

  return {
    ...query,
    history,
  };
}
