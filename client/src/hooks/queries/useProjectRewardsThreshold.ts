import { UseQueryOptions, UseQueryResult, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiGetProjectThreshold, Response } from 'api/calls/projectThreshold';
import { QUERY_KEYS } from 'api/queryKeys';
import useSubscription from 'hooks/helpers/useSubscription';
import { WebsocketListenEvent } from 'types/websocketEvents';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import useCurrentEpoch from './useCurrentEpoch';
import useIsDecisionWindowOpen from './useIsDecisionWindowOpen';

export default function useProjectRewardsThreshold(
  epoch?: number,
  options?: UseQueryOptions<Response, unknown, bigint, any>,
): UseQueryResult<bigint, unknown> {
  const queryClient = useQueryClient();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  /**
   * Socket returns estimated data for current epoch only.
   * When hook is called for other epoch, subscribe should not be used.
   */
  useSubscription<{ threshold: string }>({
    callback: data => {
      queryClient.setQueryData(
        QUERY_KEYS.projectRewardsThreshold(
          isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!,
        ),
        data,
      );
    },
    enabled: epoch === undefined && isDecisionWindowOpen !== undefined,
    event: WebsocketListenEvent.threshold,
  });

  return useQuery({
    enabled:
      !!currentEpoch &&
      currentEpoch > 1 &&
      (isDecisionWindowOpen === true || (epoch !== undefined && epoch > 0)),
    queryFn: () =>
      apiGetProjectThreshold(epoch ?? (isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!)),
    queryKey: QUERY_KEYS.projectRewardsThreshold(
      epoch ?? (isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!),
    ),
    select: response => parseUnitsBigInt(response.threshold, 'wei'),
    staleTime: Infinity,
    ...options,
  });
}
