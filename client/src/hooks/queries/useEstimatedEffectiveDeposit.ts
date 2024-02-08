import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useAccount } from 'wagmi';

import { apiGetEstimatedEffectiveDeposit, Response } from 'api/calls/effectiveDeposit';
import { QUERY_KEYS } from 'api/queryKeys';

import useCurrentEpoch from './useCurrentEpoch';

export default function useEstimatedEffectiveDeposit(
  options?: UseQueryOptions<Response, unknown, BigNumber, any>,
): UseQueryResult<BigNumber, unknown> {
  const { address } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery({
    enabled: !!currentEpoch && !!address && currentEpoch > 0,
    queryFn: () => apiGetEstimatedEffectiveDeposit(address!),
    queryKey: QUERY_KEYS.estimatedEffectiveDeposit(address!),
    select: response => parseUnits(response.effectiveDeposit, 'wei'),
    ...options,
  });
}
