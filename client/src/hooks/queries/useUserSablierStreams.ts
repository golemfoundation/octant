import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiGetUserSablierStreams, Response } from 'api/calls/userSablierStreams';
import { QUERY_KEYS } from 'api/queryKeys';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

type ReturnType = {
  sablierStreams: Response['sablierStreams'];
  sum: bigint;
  sumAvailable: bigint;
};

export default function useUserSablierStreams(): UseQueryResult<ReturnType, unknown> {
  const { address } = useAccount();

  return useQuery({
    enabled: !!address,
    queryFn: () => apiGetUserSablierStreams(address!),
    queryKey: QUERY_KEYS.sablierStreams(address!),
    select: response => ({
      sablierStreams: response.sablierStreams,
      sum: response.sablierStreams.reduce((acc, curr) => {
        return acc + parseUnitsBigInt(curr.amount, 'wei');
      }, BigInt(0)),
      sumAvailable: response.sablierStreams.reduce((acc, curr) => {
        if (curr.isCancelled) {
          return acc;
        }
        return acc + parseUnitsBigInt(curr.remainingAmount, 'wei');
      }, BigInt(0)),
    }),
  });
}
