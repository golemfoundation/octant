import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiGetWithdrawableRewards, Response } from 'api/calls/withdrawableRewards';
import { QUERY_KEYS } from 'api/queryKeys';

import useCurrentEpoch from './useCurrentEpoch';

export default function useWithdrawableRewards(
  options?: UseQueryOptions<Response, unknown, Response, any>,
): UseQueryResult<Response> {
  const { address } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    QUERY_KEYS.withdrawableUserEth,
    () => apiGetWithdrawableRewards(address as string),
    {
      enabled: !!address && !!currentEpoch && currentEpoch > 1,
      ...options,
    },
  );
}
