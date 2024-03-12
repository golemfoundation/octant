import { UseQueryResult, useQueries } from '@tanstack/react-query';

import { apiGetProposalDonors } from 'api/calls/poroposalDonors';
import { QUERY_KEYS } from 'api/queryKeys';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useProjectsContract from 'hooks/queries/useProjectsContract';

import { ProposalDonor } from './types';
import { mapDataToProjectDonors } from './utils';

export default function useProjectsDonors(epoch?: number): {
  data: { [key: string]: ProposalDonor[] };
  isFetching: boolean;
} {
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: projectsAddresses } = useProjectsContract(epoch);
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  // TODO OCT-1139 implement socket here.

  const projectsDonorsResults: UseQueryResult<ProposalDonor[]>[] = useQueries({
    queries: (projectsAddresses || []).map(projectAddress => ({
      enabled: !!projectsAddresses && isDecisionWindowOpen !== undefined,
      queryFn: () =>
        apiGetProposalDonors(
          projectAddress,
          epoch || (isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!),
        ),
      queryKey: QUERY_KEYS.projectDonors(
        projectAddress,
        epoch || (isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!),
      ),
      select: response => mapDataToProjectDonors(response),
    })),
  });

  const isFetching =
    isDecisionWindowOpen === undefined ||
    projectsAddresses === undefined ||
    projectsDonorsResults.length === 0 ||
    projectsDonorsResults.some(
      ({ isFetching: isFetchingProjectsDonorsResult }) => isFetchingProjectsDonorsResult,
    );
  if (isFetching) {
    return {
      data: {},
      isFetching,
    };
  }

  return {
    data: (projectsDonorsResults || []).reduce((acc, curr, currentIndex) => {
      return {
        ...acc,
        [projectsAddresses[currentIndex]]: curr.data,
      };
    }, {}),
    isFetching: false,
  };
}
