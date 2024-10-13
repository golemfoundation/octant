import { useQueries } from '@tanstack/react-query';
import { useCallback } from 'react';

import { apiGetProjectIpfsData, apiGetProjects } from 'api/calls/projects';
import {
  apiGetEstimatedMatchedProjectRewards,
  apiGetMatchedProjectRewards,
  Response as ResponseRewards,
} from 'api/calls/rewards';
import { apiGetAllocationsPerProject } from 'api/calls/userAllocations';
import { QUERY_KEYS } from 'api/queryKeys';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import useCurrentEpoch from './useCurrentEpoch';
import useIsDecisionWindowOpen from './useIsDecisionWindowOpen';
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

const getRewards = ({
  currentEpoch,
  isDecisionWindowOpen,
  epoch,
  rewardsEstimated,
  rewardsPast,
}: {
  currentEpoch: number | undefined;
  epoch: number | undefined;
  isDecisionWindowOpen: boolean | undefined;
  rewardsEstimated: ResponseRewards | undefined;
  rewardsPast: ResponseRewards | undefined;
}): ResponseRewards['rewards'] | undefined => {
  if (epoch === currentEpoch && isDecisionWindowOpen) {
    return rewardsEstimated?.rewards;
  }
  if (epoch !== currentEpoch) {
    return rewardsPast?.rewards;
  }
  return [];
};

export default function useSearchedProjectsDetails(
  projectsSearchResults: ProjectsSearchResults | undefined,
): ProjectsDetails {
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  const queries = useQueries({
    queries: (projectsSearchResults || []).map(projectsSearchResult => ({
      queryFn: async () => {
        const projectsEpoch = await apiGetProjects(Number(projectsSearchResult.epoch));
        const shouldFetchEstimatedRewards =
          projectsSearchResult.epoch === currentEpoch! - 1 && !!isDecisionWindowOpen;
        return Promise.all([
          projectsSearchResult.epoch,
          projectsSearchResult.address,
          apiGetProjectIpfsData(`${projectsEpoch?.projectsCid}/${projectsSearchResult.address}`),
          projectsSearchResult.epoch !== currentEpoch ||
          (projectsSearchResult.epoch === currentEpoch - 1 && isDecisionWindowOpen)
            ? apiGetAllocationsPerProject(projectsSearchResult.address, projectsSearchResult.epoch)
            : undefined,
          shouldFetchEstimatedRewards ? apiGetEstimatedMatchedProjectRewards() : undefined,
          !shouldFetchEstimatedRewards
            ? apiGetMatchedProjectRewards(projectsSearchResult.epoch)
            : undefined,
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
      const epoch = data?.[0];
      const address = data?.[1];
      const rewardsEstimated = data?.[4] ?? undefined;
      const rewardsPast = data?.[5] ?? undefined;
      const rewards = getRewards({
        currentEpoch,
        epoch,
        isDecisionWindowOpen,
        rewardsEstimated,
        rewardsPast,
      });
      const rewardsOfProject = rewards
        ? rewards.find(element => element.address === address)
        : undefined;
      const rewardsOfProjectMatched = rewardsOfProject
        ? parseUnitsBigInt(rewardsOfProject.matched, 'wei')
        : BigInt(0);
      const rewardsOfProjectAllocated = rewardsOfProject
        ? parseUnitsBigInt(rewardsOfProject.allocated, 'wei')
        : BigInt(0);

      return {
        address,
        donations: rewardsOfProjectAllocated,
        epoch: data?.[0],
        matchedRewards: rewardsOfProjectMatched,
        numberOfDonors: data?.[3]?.length ?? 0,
        totalValueOfAllocations: rewardsOfProjectMatched + rewardsOfProjectAllocated,
        ...(data?.[2] ?? {}),
      };
    }),
    isFetching: false,
    refetch,
  };
}
