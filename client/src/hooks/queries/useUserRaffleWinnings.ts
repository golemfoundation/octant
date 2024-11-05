import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiGetUserRaffleWinnings, Response } from 'api/calls/userWinnings';
import { QUERY_KEYS } from 'api/queryKeys';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

type ReturnType = {
  sum: bigint;
  winnings: Response['winnings'];
};

export default function useUserRaffleWinnings(): UseQueryResult<ReturnType, unknown> {
  const { address } = useAccount();

  return useQuery({
    enabled: !!address,
    queryFn: () => apiGetUserRaffleWinnings(address!),
    queryKey: QUERY_KEYS.raffleWinnings(address!),
    select: response => ({
      sum: response.winnings.reduce(
        (acc, curr) => acc + parseUnitsBigInt(curr.amount, 'wei'),
        BigInt(0),
      ),
      winnings: response.winnings,
    }),
  });
}
