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
    queryFn: () => apiGetUserSablierStreams('0x208de0d42a5f3f6e3bbd0e6121bd30a768824fc7'!),
    queryKey: QUERY_KEYS.sablierStreams(address!),
    select: response => ({
      sablierStreams: response.sablierStreams,
      sum: response.sablierStreams.reduce((acc, curr) => {
        return acc + parseUnitsBigInt(curr.amount, 'wei');
      }, BigInt(0)),
      sumAvailable: response.sablierStreams.reduce((acc, curr) => {
        return acc + parseUnitsBigInt(curr.remainingAmount, 'wei');
      }, BigInt(0)),
    }),
  });
}
