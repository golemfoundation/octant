import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useAccount } from 'wagmi';

import { apiGetWithdrawableRewards, Response } from 'api/calls/withdrawableRewards';
import { QUERY_KEYS } from 'api/queryKeys';

import useCurrentEpoch from './useCurrentEpoch';

interface WithdrawableRewards {
  array: Response;
  sum: BigNumber;
}

export default function useWithdrawableRewards(
  options?: UseQueryOptions<Response, unknown, WithdrawableRewards, any>,
): UseQueryResult<WithdrawableRewards> {
  const { address } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    QUERY_KEYS.withdrawableRewards,
    () => apiGetWithdrawableRewards(address as string),
    {
      enabled: !!address && !!currentEpoch && currentEpoch > 1,
      select: data => ({
        array: data,
        sum: data
          ? data.reduce((acc, { amount }) => acc.add(parseUnits(amount, 'wei')), BigNumber.from(0))
          : BigNumber.from(0),
      }),
      ...options,
    },
  );
}
