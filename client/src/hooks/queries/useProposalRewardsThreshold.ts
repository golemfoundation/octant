import { UseQueryOptions, UseQueryResult, useQuery, useQueryClient } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

import { apiGetProjectThreshold, Response } from 'api/calls/projectThreshold';
import { QUERY_KEYS } from 'api/queryKeys';
import useSubscription from 'hooks/helpers/useSubscription';
import { WebsocketListenEvent } from 'types/websocketEvents';

import useCurrentEpoch from './useCurrentEpoch';
import useIsDecisionWindowOpen from './useIsDecisionWindowOpen';

export default function useProposalRewardsThreshold(
  epoch?: number,
  options?: UseQueryOptions<Response, unknown, BigNumber, any>,
): UseQueryResult<BigNumber, unknown> {
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
        QUERY_KEYS.proposalRewardsThreshold(
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
      isDecisionWindowOpen !== undefined &&
      ((epoch !== undefined && epoch > 0) || (!!currentEpoch && currentEpoch > 1)),
    queryFn: () =>
      apiGetProjectThreshold(epoch ?? (isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!)),
    queryKey: QUERY_KEYS.proposalRewardsThreshold(
      epoch ?? (isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!),
    ),
    select: response => parseUnits(response.threshold, 'wei'),
    staleTime: Infinity,
    ...options,
  });
}
