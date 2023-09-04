import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useAccount } from 'wagmi';

import { apiGetWithdrawableRewards, Response } from 'api/calls/withdrawableRewards';
import { QUERY_KEYS } from 'api/queryKeys';

import useCurrentEpoch from './useCurrentEpoch';

export default function useWithdrawableUserEth(
  options?: UseQueryOptions<Response, unknown, BigNumber, any>,
): UseQueryResult<BigNumber> {
  const { address } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    QUERY_KEYS.withdrawableUserEth,
    () => apiGetWithdrawableRewards(address as string),
    {
      enabled: !!address && !!currentEpoch && currentEpoch > 1,
      select: data => {
        const sum = data.reduce((prev, { amount }) => prev + parseFloat(amount), 0);
        return parseUnits(sum.toString(), 'wei');
      },
      ...options,
    },
  );
}
