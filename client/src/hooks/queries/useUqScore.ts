import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiGetUqScore } from 'api/calls/uqScore';
import { QUERY_KEYS } from 'api/queryKeys';

export default function useUqScore(epoch: number): UseQueryResult<number, unknown> {
  const { address } = useAccount();

  return useQuery({
    enabled: !!address,
    queryFn: () => apiGetUqScore(address!, epoch),
    queryKey: QUERY_KEYS.uqScore(epoch),
    select: data => data.score,
  });
}
