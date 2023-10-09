import { UseQueryResult, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiGetUserAllocationNonce } from 'api/calls/allocate';
import { QUERY_KEYS } from 'api/queryKeys';

export default function useUserAllocationNonce(
  options?: UseQueryOptions<{ allocation_nonce: number }, unknown, number, any>,
): UseQueryResult<number> {
  const { address } = useAccount();

  return useQuery(
    QUERY_KEYS.userAllocationNonce(address!),
    () => apiGetUserAllocationNonce(address!),
    {
      enabled: !!address,
      select: response => response.allocation_nonce,
      ...options,
    },
  );
}
