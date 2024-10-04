import { useQueries } from '@tanstack/react-query';
import { useCallback } from 'react';

import { apiGetProjectIpfsData, apiGetProjects } from 'api/calls/projects';
import {
  apiGetEstimatedMatchedProjectRewards,
  apiGetMatchedProjectRewards,
} from 'api/calls/rewards';
import { apiGetAllocationsPerProject } from 'api/calls/userAllocations';
import { QUERY_KEYS } from 'api/queryKeys';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import useCurrentEpoch from './useCurrentEpoch';
import { ProjectIpfsWithRewards } from './useProjectsIpfsWithRewards';
import { ProjectsSearchResults } from './useSearchedProjects';

export interface ProjectsIpfsWithRewardsAndEpochs extends ProjectIpfsWithRewards {
  address: string;
  epoch: number;
}

export interface ProjectsDetails {
  data: ProjectsIpfsWithRewardsAndEpochs[];
  isFetching: boolean;
  refetch: () => void;
}

export default function useSearchedProjectsDetails(
  projectsSearchResults: ProjectsSearchResults | undefined,
): ProjectsDetails {
  const { data: currentEpoch } = useCurrentEpoch();

  const queries = useQueries({
    queries: (projectsSearchResults || []).map(projectsSearchResult => ({
      queryFn: async () => {
        const projectsEpoch = await apiGetProjects(Number(projectsSearchResult.epoch));
        return Promise.all([
          apiGetProjectIpfsData(`${projectsEpoch?.projectsCid}/${projectsSearchResult.address}`),
          projectsSearchResult.epoch === currentEpoch
            ? apiGetEstimatedMatchedProjectRewards()
            : apiGetMatchedProjectRewards(projectsSearchResult.epoch),
          apiGetAllocationsPerProject(projectsSearchResult.address, projectsSearchResult.epoch),
          projectsSearchResult.epoch,
          projectsSearchResult.address,
        ]);
      },
      queryKey: QUERY_KEYS.searchResultsDetails(
        projectsSearchResult.address,
        projectsSearchResult.epoch,
      ),
      retry: false,
    })),
  });

  // Trick from https://github.com/TanStack/query/discussions/3364#discussioncomment-2287991.
  const refetch = useCallback(() => {
    queries.forEach(result => result.refetch());
  }, [queries]);

  const isFetchingQueries = queries.some(({ isFetching }) => isFetching);

  if (isFetchingQueries) {
    return {
      data: [],
      isFetching: isFetchingQueries,
      refetch,
    };
  }

  return {
    data: queries.map(({ data }) => {
      const rewards = data?.[1]?.rewards ?? [];
      const address = data?.[4];
      const rewardsOfProject = rewards.find(element => element.address === address);
      const rewardsOfProjectMatched = rewardsOfProject
        ? parseUnitsBigInt(rewardsOfProject.matched, 'wei')
        : BigInt(0);
      const rewardsOfProjectAllocated = rewardsOfProject
        ? parseUnitsBigInt(rewardsOfProject.allocated, 'wei')
        : BigInt(0);

      return {
        address,
        donations: rewardsOfProjectAllocated,
        epoch: data?.[3],
        matchedRewards: rewardsOfProjectMatched,
        numberOfDonors: data?.[2].length ?? 0,
        totalValueOfAllocations: rewardsOfProjectMatched + rewardsOfProjectAllocated,
        ...(data?.[0] ?? {}),
      };
    }),
    isFetching: false,
    refetch,
  };
}
