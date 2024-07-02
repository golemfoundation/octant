import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiGetAntisybilStatus, Response } from 'api/calls/antisybilStatus';
import { QUERY_KEYS } from 'api/queryKeys';

export default function useAntisybilStatusScore(
  options?: Omit<UseQueryOptions<Response, unknown, number, any>, 'queryKey'>,
): UseQueryResult<number, unknown> {
  const { address } = useAccount();
  return useQuery({
    enabled: !!address,
    queryFn: () => apiGetAntisybilStatus(address!),
    queryKey: QUERY_KEYS.antisybilStatus(address!),
    refetchOnMount: true,
    select: response => Math.round(parseFloat(response.score)),
    ...options,
  });
}
