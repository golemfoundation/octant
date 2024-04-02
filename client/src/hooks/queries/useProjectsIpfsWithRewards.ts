import env from 'env';
import { ExtendedProject } from 'types/extended-project';
import getSortedElementsByTotalValueOfAllocationsAndAlphabetical from 'utils/getSortedElementsByTotalValueOfAllocationsAndAlphabetical';

import useProjectsDonors from './donors/useProjectsDonors';
import useMatchedProjectRewards from './useMatchedProjectRewards';
import useProjectsContract from './useProjectsContract';
import useProjectsIpfs from './useProjectsIpfs';

export interface ProjectIpfsWithRewards extends ExtendedProject {
  address: string;
  numberOfDonors: number;
  percentage: number | undefined;
  totalValueOfAllocations: bigint | undefined;
}

export default function useProjectsIpfsWithRewards(epoch?: number): {
  data: ProjectIpfsWithRewards[];
  isFetching: boolean;
} {
  // TODO OCT-1270 TODO OCT-1312 Remove this override.
  const epochOverrideForDataFetch = env.network === 'Mainnet' && epoch === 2 ? 3 : epoch;

  const { data: projectsAddresses, isFetching: isFetchingProjectsContract } =
    useProjectsContract(epochOverrideForDataFetch);
  const { data: projectsIpfs, isFetching: isFetchingProjectsIpfs } = useProjectsIpfs(
    projectsAddresses,
    epochOverrideForDataFetch,
  );
  const {
    data: matchedProjectRewards,
    isFetching: isFetchingMatchedProjectRewards,
    isRefetching: isRefetchingMatchedProjectRewards,
  } = useMatchedProjectRewards(epoch);

  const {
    data: projectsDonors,
    isFetching: isFetchingProjectsDonors,
    isSuccess: isSuccessProjectsDonors,
  } = useProjectsDonors(epoch);

  const isFetching =
    isFetchingProjectsContract ||
    isFetchingProjectsIpfs ||
    (isFetchingMatchedProjectRewards && !isRefetchingMatchedProjectRewards) ||
    isFetchingProjectsDonors;
  if (isFetching) {
    return {
      data: [],
      isFetching,
    };
  }

  const projectsWithRewards = (projectsIpfs || []).map(project => {
    const projectMatchedProjectRewards = matchedProjectRewards?.find(
      ({ address }) => address === project.address,
    );
    /**
     * For epochs finalized projectMatchedProjectRewards contains data only for projects that
     * passed threshold. For those that did not, we reduce on their donors and get the value.
     */
    const totalValueOfAllocations =
      projectMatchedProjectRewards?.sum ||
      (isSuccessProjectsDonors
        ? projectsDonors[project.address].reduce((acc, curr) => acc + curr.amount, BigInt(0))
        : BigInt(0));
    return {
      numberOfDonors: isSuccessProjectsDonors ? projectsDonors[project.address].length : 0,
      percentage: projectMatchedProjectRewards?.percentage,
      totalValueOfAllocations,
      ...project,
    };
  });

  return {
    data: getSortedElementsByTotalValueOfAllocationsAndAlphabetical(projectsWithRewards),
    isFetching,
  };
}
