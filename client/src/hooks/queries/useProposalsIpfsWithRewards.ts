import { BigNumber } from 'ethers';

import { ExtendedProposal } from 'types/extended-proposal';
import getSortedElementsByTotalValueOfAllocationsAndAlphabetical from 'utils/getSortedElementsByTotalValueOfAllocationsAndAlphabetical';

import useProposalsDonors from './donors/useProposalsDonors';
import useMatchedProposalRewards from './useMatchedProposalRewards';
import useProposalsContract from './useProposalsContract';
import useProposalsIpfs from './useProposalsIpfs';

export interface ProposalIpfsWithRewards extends ExtendedProposal {
  address: string;
  numberOfDonors: number;
  percentage: number | undefined;
  totalValueOfAllocations: BigNumber | undefined;
}

export default function useProposalsIpfsWithRewards(epoch?: number): {
  data: ProposalIpfsWithRewards[];
  isFetching: boolean;
} {
  const { data: proposalsAddresses, isFetching: isFetchingProposalsContract } =
    useProposalsContract(epoch);
  const { data: proposalsIpfs, isFetching: isFetchingProposalsIpfs } = useProposalsIpfs(
    proposalsAddresses,
    epoch,
  );
  const {
    data: matchedProposalRewards,
    isFetching: isFetchingMatchedProposalRewards,
    isRefetching: isRefetchingMatchedProposalRewards,
  } = useMatchedProposalRewards(epoch);
  const { data: proposalsDonors, isFetching: isFetchingProposalsDonors } =
    useProposalsDonors(epoch);

  const isFetching =
    isFetchingProposalsContract ||
    isFetchingProposalsIpfs ||
    (isFetchingMatchedProposalRewards && !isRefetchingMatchedProposalRewards) ||
    isFetchingProposalsDonors;
  if (isFetching) {
    return {
      data: [],
      isFetching,
    };
  }

  const proposalsWithRewards = (proposalsIpfs || []).map(proposal => {
    const proposalMatchedProposalRewards = matchedProposalRewards?.find(
      ({ address }) => address === proposal.address,
    );
    /**
     * For epochs finalized proposalMatchedProposalRewards contains data only for projects that
     * passed threshold. For those that did not, we reduce on their donors and get the value.
     */
    const totalValueOfAllocations =
      proposalMatchedProposalRewards?.sum ||
      proposalsDonors[proposal.address].reduce(
        (acc, curr) => acc.add(curr.amount),
        BigNumber.from(0),
      );
    return {
      numberOfDonors: proposalsDonors[proposal.address].length,
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
