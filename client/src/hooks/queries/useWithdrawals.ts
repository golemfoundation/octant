import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiGetWithdrawals, Response } from 'api/calls/withdrawableRewards';
import { QUERY_KEYS } from 'api/queryKeys';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import useCurrentEpoch from './useCurrentEpoch';

interface Withdrawals {
  sums: {
    available: bigint;
    pending: bigint;
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
          const amountBigInt = parseUnitsBigInt(curr.amount, 'wei');
          return curr.status === 'available'
            ? {
                ...acc,
                available: acc.available + amountBigInt,
              }
            : {
                ...acc,
                pending: acc.pending + amountBigInt,
              };
        },
        { available: BigInt(0), pending: BigInt(0) },
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
