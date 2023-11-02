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
): UseQueryResult<BigNumber> {
  const queryClient = useQueryClient();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  /**
   * Socket returns estimated data for current epoch only.
   * When hook is called for other epoch, subscribe should not be used.
   */
  useSubscription<{ threshold: string }>(WebsocketListenEvent.threshold, data => {
    // eslint-disable-next-line chai-friendly/no-unused-expressions
    epoch
      ? null
      : queryClient.setQueryData(QUERY_KEYS.proposalRewardsThreshold(currentEpoch! - 1), data);
  });

  return useQuery(
    QUERY_KEYS.proposalRewardsThreshold(epoch || currentEpoch! - 1),
    () => apiGetProjectThreshold(epoch || currentEpoch! - 1),
    {
      enabled:
        (epoch !== undefined && epoch > 0) ||
        (!!currentEpoch && currentEpoch > 1 && isDecisionWindowOpen),
      select: response => parseUnits(response.threshold, 'wei'),
      staleTime: Infinity,
      ...options,
    },
  );
}
