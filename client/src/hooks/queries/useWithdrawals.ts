import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useAccount } from 'wagmi';

import { apiGetWithdrawals, Response } from 'api/calls/withdrawableRewards';
import { QUERY_KEYS } from 'api/queryKeys';

import useCurrentEpoch from './useCurrentEpoch';

interface Withdrawals {
  sums: {
    available: BigNumber;
    pending: BigNumber;
  };
  withdrawalsAvailable: Response;
}

export default function useWithdrawals(
  options?: UseQueryOptions<Response, unknown, Withdrawals, any>,
): UseQueryResult<Withdrawals, unknown> {
  const { address } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery({
    enabled: !!address && !!currentEpoch && currentEpoch > 1,
    queryFn: () => apiGetWithdrawals(address as string),
    queryKey: QUERY_KEYS.withdrawals,
    select: data => {
      const sums = data.reduce(
        (acc, curr) => {
          const amountBigNumber = parseUnits(curr.amount, 'wei');
          return curr.status === 'available'
            ? {
                ...acc,
                available: acc.available.add(amountBigNumber),
              }
            : {
                ...acc,
                pending: acc.pending.add(amountBigNumber),
              };
        },
        { available: BigNumber.from(0), pending: BigNumber.from(0) },
      );
      const withdrawalsAvailable = data.filter(element => element.status === 'available');
      return {
        sums,
        withdrawalsAvailable,
      };
    },
    ...options,
  });
}
