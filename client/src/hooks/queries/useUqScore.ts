import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiGetUqScore } from 'api/calls/uqScore';
import { QUERY_KEYS } from 'api/queryKeys';

import useIsDecisionWindowOpen from './useIsDecisionWindowOpen';

export default function useUqScore(epoch: number): UseQueryResult<bigint, unknown> {
  const { address } = useAccount();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  return useQuery({
    enabled: !!address && !!epoch && isDecisionWindowOpen,
    queryFn: () => apiGetUqScore(address!, epoch),
    queryKey: QUERY_KEYS.uqScore(epoch),
    // We expose it as bigint percentage multiplier, from 0 to 100.
    select: data => BigInt(parseFloat(data.uniquenessQuotient) * 100),
  });
}
