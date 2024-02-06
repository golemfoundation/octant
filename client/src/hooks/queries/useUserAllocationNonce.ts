import { UseQueryResult, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiGetUserAllocationNonce, ApiGetUserAllocationNonceResponse } from 'api/calls/allocate';
import { QUERY_KEYS } from 'api/queryKeys';

export default function useUserAllocationNonce(
  options?: UseQueryOptions<ApiGetUserAllocationNonceResponse, unknown, number, any>,
): UseQueryResult<number, unknown> {
  const { address } = useAccount();

  return useQuery({
    enabled: !!address,
    queryFn: () => apiGetUserAllocationNonce(address!),
    queryKey: QUERY_KEYS.userAllocationNonce(address!),
    select: response => response.allocationNonce,
    ...options,
  });
}
