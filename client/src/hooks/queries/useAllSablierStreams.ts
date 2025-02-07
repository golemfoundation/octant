import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { apiGetAllSablierStreams } from 'api/calls/userSablierStreams';
import { QUERY_KEYS } from 'api/queryKeys';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

export default function useAllSablierStreamsSum(): UseQueryResult<bigint, unknown> {
  return useQuery({
    queryFn: () => apiGetAllSablierStreams(),
    queryKey: QUERY_KEYS.allSablierStreams,
    select: response => {
      const { sablierStreams } = response;
      return sablierStreams.reduce(
        (acc, curr) => (!curr.isCancelled ? acc + parseUnitsBigInt(curr.amount, 'wei') : acc),
        BigInt(0),
      );
    },
  });
}
