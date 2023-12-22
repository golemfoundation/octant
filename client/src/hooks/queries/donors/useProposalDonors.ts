import { UseQueryOptions, UseQueryResult, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiGetProposalDonors, Response } from 'api/calls/poroposalDonors';
import { QUERY_KEYS } from 'api/queryKeys';
import useSubscription from 'hooks/helpers/useSubscription';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import { WebsocketListenEvent } from 'types/websocketEvents';

import { ProposalDonor } from './types';
import { mapDataToProposalDonors } from './utils';

export default function useProposalDonors(
  proposalAddress: string,
  epoch?: number,
  options?: UseQueryOptions<Response, unknown, ProposalDonor[], any>,
): UseQueryResult<ProposalDonor[]> {
  const queryClient = useQueryClient();
  const { data: currentEpoch } = useCurrentEpoch();

  /**
   * Socket returns proposal donors for current epoch only.
   * When hook is called for other epoch, subscribe should not be used.
   */
  // TODO OCT-1139 check if socket works correctly, update if needed.
  useSubscription<Response>({
    callback: data => {
      queryClient.setQueryData(QUERY_KEYS.proposalDonors(proposalAddress, currentEpoch! - 1), data);
    },
    enabled: epoch === undefined,
    event: WebsocketListenEvent.proposalDonors,
  });

  return useQuery(
    QUERY_KEYS.proposalDonors(proposalAddress, epoch || currentEpoch! - 1),
    () => apiGetProposalDonors(proposalAddress, epoch || currentEpoch! - 1),
    {
      enabled: !!proposalAddress && (epoch !== undefined || !!(currentEpoch && currentEpoch > 1)),
      select: response => mapDataToProposalDonors(response),
      staleTime: Infinity,
      ...options,
    },
  );
}
