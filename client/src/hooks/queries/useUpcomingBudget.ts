import { UseQueryResult, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiGetUpcomingBudget, Response } from 'api/calls/upcomingBudget';
import { QUERY_KEYS } from 'api/queryKeys';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import useIsDecisionWindowOpen from './useIsDecisionWindowOpen';

export default function useUpcomingBudget(
  options?: UseQueryOptions<Response, unknown, bigint, any>,
): UseQueryResult<bigint, unknown> {
  const { address } = useAccount();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  return useQuery({
    enabled: !!address && isDecisionWindowOpen === false,
    queryFn: () => apiGetUpcomingBudget(address!),
    queryKey: QUERY_KEYS.upcomingBudget(address!),
    refetchInterval: 60000, // 60s
    select: response => parseUnitsBigInt(response.upcomingBudget, 'wei'),
    ...options,
  });
}
