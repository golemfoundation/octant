import { UseQueryOptions, UseQueryResult, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiGetProposalDonors, Response } from 'api/calls/poroposalDonors';
import { QUERY_KEYS } from 'api/queryKeys';
import useSubscription from 'hooks/helpers/useSubscription';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import { WebsocketListenEvent } from 'types/websocketEvents';

import { ProposalDonor } from './types';
import { mapDataToProposalDonors } from './utils';

export default function useProposalDonors(
  proposalAddress: string,
  epoch?: number,
  options?: UseQueryOptions<Response, unknown, ProposalDonor[], any>,
): UseQueryResult<ProposalDonor[], unknown> {
  const queryClient = useQueryClient();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  /**
   * Socket returns proposal donors for current epoch only.
   * When hook is called for other epoch, subscribe should not be used.
   */
  // TODO OCT-1139 check if socket works correctly, update if needed.
  useSubscription<Response>({
    callback: data => {
      queryClient.setQueryData(
        QUERY_KEYS.proposalDonors(
          proposalAddress,
          epoch || (isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!),
        ),
        data,
      );
    },
    enabled: epoch === undefined && isDecisionWindowOpen !== undefined,
    event: WebsocketListenEvent.proposalDonors,
  });

  return useQuery({
    enabled: !!proposalAddress && (epoch !== undefined || !!(currentEpoch && currentEpoch > 1)),
    queryFn: () =>
      apiGetProposalDonors(
        proposalAddress,
        epoch || (isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!),
      ),
    queryKey: QUERY_KEYS.proposalDonors(
      proposalAddress,
      epoch || (isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!),
    ),
    select: response => mapDataToProposalDonors(response),
    staleTime: Infinity,
    ...options,
  });
}
