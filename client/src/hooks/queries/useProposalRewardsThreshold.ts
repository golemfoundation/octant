import { UseQueryOptions, UseQueryResult, useQuery, useQueryClient } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

import { apiGetProjectThreshold, Response } from 'api/calls/projectThreshold';
import { QUERY_KEYS } from 'api/queryKeys';
import useSubscription from 'hooks/helpers/useSubscription';
import { WebsocketListenEvent } from 'types/websocketEvents';

import useCurrentEpoch from './useCurrentEpoch';

export default function useProposalRewardsThreshold(
  options?: UseQueryOptions<Response, unknown, BigNumber, any>,
): UseQueryResult<BigNumber> {
  const queryClient = useQueryClient();
  const { data: currentEpoch } = useCurrentEpoch();

  useSubscription<{ threshold: string }>(WebsocketListenEvent.threshold, data => {
    queryClient.setQueryData(QUERY_KEYS.proposalRewardsThreshold, parseUnits(data.threshold, 'wei'));
  });

  return useQuery(
    QUERY_KEYS.proposalRewardsThreshold,
    () => apiGetProjectThreshold(currentEpoch!),
    {
      enabled: !!currentEpoch,
      select: response => parseUnits(response.threshold, 'wei'),
      staleTime: Infinity,
      ...options,
    },
  );
}
