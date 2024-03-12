import { ExtendedProposal } from 'types/extended-proposal';
import getSortedElementsByTotalValueOfAllocationsAndAlphabetical from 'utils/getSortedElementsByTotalValueOfAllocationsAndAlphabetical';

import useProjectsDonors from './donors/useProjectsDonors';
import useMatchedProjectRewards from './useMatchedProjectRewards';
import useProjectsContract from './useProjectsContract';
import useProposalsIpfs from './useProposalsIpfs';

export interface ProposalIpfsWithRewards extends ExtendedProposal {
  address: string;
  numberOfDonors: number;
  percentage: number | undefined;
  totalValueOfAllocations: bigint | undefined;
}

export default function useProposalsIpfsWithRewards(epoch?: number): {
  data: ProposalIpfsWithRewards[];
  isFetching: boolean;
} {
  // TODO OCT-1270 TODO OCT-1312 Remove this override.
  const epochOverrideForDataFetch = epoch === 2 ? 3 : epoch;

  const { data: projectsAddresses, isFetching: isFetchingProjectsContract } =
    useProjectsContract(epochOverrideForDataFetch);
  const { data: proposalsIpfs, isFetching: isFetchingProposalsIpfs } = useProposalsIpfs(
    projectsAddresses,
    epochOverrideForDataFetch,
  );
  const {
    data: matchedProjectRewards,
    isFetching: isFetchingMatchedProjectRewards,
    isRefetching: isRefetchingMatchedProposalRewards,
  } = useMatchedProjectRewards(epoch);
  const { data: projectsDonors, isFetching: isFetchingProposalsDonors } = useProjectsDonors(epoch);

  const isFetching =
    isFetchingProjectsContract ||
    isFetchingProposalsIpfs ||
    (isFetchingMatchedProjectRewards && !isRefetchingMatchedProposalRewards) ||
    isFetchingProposalsDonors;
  if (isFetching) {
    return {
      data: [],
      isFetching,
    };
  }

  const proposalsWithRewards = (proposalsIpfs || []).map(proposal => {
    const proposalMatchedProposalRewards = matchedProjectRewards?.find(
      ({ address }) => address === proposal.address,
    );
    /**
     * For epochs finalized proposalMatchedProposalRewards contains data only for projects that
     * passed threshold. For those that did not, we reduce on their donors and get the value.
     */
    const totalValueOfAllocations =
      proposalMatchedProposalRewards?.sum ||
      projectsDonors[proposal.address].reduce((acc, curr) => acc + curr.amount, BigInt(0));
    return {
      numberOfDonors: projectsDonors[proposal.address].length,
      percentage: proposalMatchedProposalRewards?.percentage,
      totalValueOfAllocations,
      ...proposal,
    };
  });

  return {
    data: getSortedElementsByTotalValueOfAllocationsAndAlphabetical(proposalsWithRewards),
    isFetching,
  };
}
