import { UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetProjects, Projects } from 'api/calls/projects';
import { QUERY_KEYS } from 'api/queryKeys';

import useCurrentEpoch from './useCurrentEpoch';
import useIsDecisionWindowOpen from './useIsDecisionWindowOpen';

export default function useProjectsEpoch(epoch?: number): UseQueryResult<Projects, unknown> {
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: currentEpoch } = useCurrentEpoch();

  // When decision window is open, fetch projects from the previous epoch, because that's what users should be allocating to.
  const epochToUse = epoch ?? (isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!);

  return useQuery({
    enabled:
      !!currentEpoch && ((isDecisionWindowOpen && currentEpoch > 0) || !isDecisionWindowOpen),

    queryFn: () => apiGetProjects(epochToUse),
    queryKey: epoch || currentEpoch ? QUERY_KEYS.projectsEpoch(epochToUse) : [''],
  });
}
