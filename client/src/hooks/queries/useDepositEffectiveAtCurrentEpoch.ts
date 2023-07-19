import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useAccount } from 'wagmi';

import { apiGetEffectiveDeposit, Response } from 'api/calls/effectiveDeposit';
import { QUERY_KEYS } from 'api/queryKeys';

import useCurrentEpoch from './useCurrentEpoch';

export default function useDepositEffectiveAtCurrentEpoch(
  options?: UseQueryOptions<Response, unknown, BigNumber, any>,
): UseQueryResult<BigNumber> {
  const { address } = useAccount();

  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    currentEpoch ? QUERY_KEYS.depositAtGivenEpoch(currentEpoch) : [''],
    () => apiGetEffectiveDeposit(address!, currentEpoch!),
    {
      enabled: !!currentEpoch && !!address && currentEpoch > 1,
      select: response => parseUnits(response.effectiveDeposit, 'wei'),
      ...options,
    },
  );
}
