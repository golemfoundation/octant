import {
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import {
  apiGetHistory,
  Response,
  ResponseHistoryItem,
  PatronModeEventType,
  BlockchainEventType,
  AllocationEventType,
} from 'api/calls/history';
import { QUERY_KEYS } from 'api/queryKeys';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

type AllocationEventTypeParsed = Omit<AllocationEventType, 'allocations'> & {
  allocations: {
    address: string;
    amount: bigint;
  }[];
};

interface EventData
  extends Omit<PatronModeEventType, 'amount'>,
    Omit<BlockchainEventType, 'amount'>,
    AllocationEventTypeParsed {
  amount: bigint;
}

type HistoryElementPatronModeEvent = Omit<ResponseHistoryItem, 'eventData'> & {
  eventData: Omit<PatronModeEventType, 'amount'> & { amount: bigint };
};

export type HistoryElementBlockchainEventEvent = Omit<ResponseHistoryItem, 'eventData'> & {
  eventData: Omit<BlockchainEventType, 'amount'> & { amount: bigint };
};

type HistoryElementAllocationEventEvent = Omit<ResponseHistoryItem, 'eventData'> & {
  eventData: Omit<AllocationEventTypeParsed, 'amount'> & { amount: bigint };
};

export type HistoryElement =
  | HistoryElementPatronModeEvent
  | HistoryElementBlockchainEventEvent
  | HistoryElementAllocationEventEvent;

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

  const history = historyFromPages.map<HistoryElement>(({ eventData, ...rest }) => {
    const amount =
      rest.type === 'allocation'
        ? (eventData as AllocationEventType).allocations.reduce((acc, curr) => {
            return acc + parseUnitsBigInt(curr.amount, 'wei');
          }, BigInt(0))
        : parseUnitsBigInt((eventData as PatronModeEventType | BlockchainEventType).amount, 'wei');

    return {
      eventData: {
        ...(rest.type === 'allocation'
          ? {
              ...(eventData as AllocationEventType),
              allocations: (eventData as AllocationEventType).allocations.map(element => ({
                address: element.project,
                amount: parseUnitsBigInt(element.amount, 'wei'),
              })),
            }
          : (eventData as PatronModeEventType | BlockchainEventType)),
        amount,
      } as EventData,
      ...rest,
    };
  });

  return {
    ...query,
    history,
  };
}
