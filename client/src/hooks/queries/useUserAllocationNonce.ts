import { UseQueryResult, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiGetUserAllocationNonce, ApiGetUserAllocationNonceData } from 'api/calls/allocate';
import { QUERY_KEYS } from 'api/queryKeys';

export default function useUserAllocationNonce(
  options?: UseQueryOptions<ApiGetUserAllocationNonceData, unknown, number, any>,
): UseQueryResult<number> {
  const { address } = useAccount();

  return useQuery(
    QUERY_KEYS.userAllocationNonce(address!),
    () => apiGetUserAllocationNonce(address!),
    {
      enabled: !!address,
      select: response => response.allocationNonce,
      ...options,
    },
  );
}
