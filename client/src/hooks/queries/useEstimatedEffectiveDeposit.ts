import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiGetEstimatedEffectiveDeposit, Response } from 'api/calls/effectiveDeposit';
import { QUERY_KEYS } from 'api/queryKeys';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import useCurrentEpoch from './useCurrentEpoch';

export default function useEstimatedEffectiveDeposit(
  options?: UseQueryOptions<Response, unknown, bigint, any>,
): UseQueryResult<bigint, unknown> {
  const { address } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery({
    enabled: !!currentEpoch && !!address && currentEpoch > 0,
    queryFn: () => apiGetEstimatedEffectiveDeposit(address!),
    queryKey: QUERY_KEYS.estimatedEffectiveDeposit(address!),
    select: response => parseUnitsBigInt(response.effectiveDeposit, 'wei'),
    ...options,
  });
}
