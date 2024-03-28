import { UseQueryOptions, UseQueryResult, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiGetProjectDonors, Response } from 'api/calls/projectDonors';
import { QUERY_KEYS } from 'api/queryKeys';
import useSubscription from 'hooks/helpers/useSubscription';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import { WebsocketListenEvent } from 'types/websocketEvents';

import { ProjectDonor } from './types';
import { mapDataToProjectDonors } from './utils';

export const isEnabled = (isDecisionWindowOpen?: boolean, epoch?: number): boolean =>
  isDecisionWindowOpen === true || epoch !== undefined;

export default function useProjectDonors(
  projectAddress: string,
  epoch?: number,
  options?: UseQueryOptions<Response, unknown, ProjectDonor[], any>,
): UseQueryResult<ProjectDonor[], unknown> {
  const queryClient = useQueryClient();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  /**
   * Socket returns project donors for current epoch only.
   * When hook is called for other epoch, subscribe should not be used.
   */
  // TODO OCT-1139 check if socket works correctly, update if needed.
  useSubscription<Response>({
    callback: data => {
      queryClient.setQueryData(
        QUERY_KEYS.projectDonors(
          projectAddress,
          epoch || (isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!),
        ),
        data,
      );
    },
    enabled: epoch === undefined && isDecisionWindowOpen !== undefined,
    event: WebsocketListenEvent.projectDonors,
  });

  return useQuery({
    enabled: !!projectAddress && isEnabled(isDecisionWindowOpen, epoch),
    queryFn: () => apiGetProjectDonors(projectAddress, epoch || currentEpoch! - 1),
    queryKey: QUERY_KEYS.projectDonors(projectAddress, epoch || currentEpoch! - 1),
    select: response => mapDataToProjectDonors(response),
    staleTime: Infinity,
    ...options,
  });
}
