import { UseQueryOptions, UseQueryResult, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiGetProjectThreshold, Response } from 'api/calls/projectThreshold';
import { QUERY_KEYS } from 'api/queryKeys';
import useSubscription from 'hooks/helpers/useSubscription';
import { WebsocketListenEvent } from 'types/websocketEvents';

import useCurrentEpoch from './useCurrentEpoch';

export default function useProposalRewardsThresholdFraction(
  options?: UseQueryOptions<Response, unknown, number, any>,
): UseQueryResult<number> {
  const queryClient = useQueryClient();
  const { data: currentEpoch } = useCurrentEpoch();

  useSubscription<{ threshold: string }>(WebsocketListenEvent.threshold, data => {
    queryClient.setQueryData(
      QUERY_KEYS.proposalRewardsThresholdFraction,
      parseFloat(data.threshold),
    );
  });

  return useQuery(
    QUERY_KEYS.proposalRewardsThresholdFraction,
    () => apiGetProjectThreshold(currentEpoch!),
    {
      enabled: !!currentEpoch,
      select: response => parseFloat(response.threshold),
      staleTime: Infinity,
      ...options,
    },
  );
}
