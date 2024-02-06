import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiGetUserTOS, Response } from 'api/calls/userTOS';
import { QUERY_KEYS } from 'api/queryKeys';

export default function useUserTOS(
  options?: UseQueryOptions<Response, unknown, boolean, any>,
): UseQueryResult<boolean, unknown> {
  const { address } = useAccount();

  return useQuery({
    enabled: !!address,
    queryFn: () => apiGetUserTOS(address!),
    queryKey: QUERY_KEYS.userTOS(address!),
    select: response => response.accepted,
    ...options,
  });
}
