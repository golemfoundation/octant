import { UseQueryOptions, UseQueryResult, useQuery, useQueryClient } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

import { apiGetUsersAllocationsSum, Response } from 'api/calls/usersAllocationsSum';
import { QUERY_KEYS } from 'api/queryKeys';
import useSubscription from 'hooks/helpers/useSubscription';
import { WebsocketListenEvent } from 'types/websocketEvents';

export default function useUsersAllocationsSum(
  options?: UseQueryOptions<Response, unknown, BigNumber, any>,
): UseQueryResult<BigNumber> {
  const queryClient = useQueryClient();

  useSubscription<{ amount: string }>(WebsocketListenEvent.allocationsSum, data => {
    queryClient.setQueryData(QUERY_KEYS.usersAllocationsSum, parseUnits(data.amount));
  });

  return useQuery(QUERY_KEYS.usersAllocationsSum, () => apiGetUsersAllocationsSum(), {
    select: response => parseUnits(response.amount),
    staleTime: Infinity,
    ...options,
  });
}
