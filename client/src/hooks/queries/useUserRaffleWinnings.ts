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
    select: _response => {
      const response: Response = {
        winnings: [
          {
            amount: '50000000000000000000000',
            dateAvailableForWithdrawal: 1730721779,
          },
          {
            amount: '60000000000000000000000',
            dateAvailableForWithdrawal: 1730721779,
          },
        ],
      };
      return {
        sum: response.winnings.reduce(
          (acc, curr) => acc + parseUnitsBigInt(curr.amount, 'wei'),
          BigInt(0),
        ),
        winnings: response.winnings,
      };
      // return response.winnings;
    },
  });
}
