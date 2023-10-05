import { BigNumber } from 'ethers';

import { ExtendedProposal } from 'types/extended-proposal';
import getSortedElementsByTotalValueOfAllocationsAndAlphabetical from 'utils/getSortedElementsByTotalValueOfAllocationsAndAlphabetical';

import useMatchedProposalRewards from './useMatchedProposalRewards';
import useProposalsContract from './useProposalsContract';
import useProposalsIpfs from './useProposalsIpfs';

export interface ProposalIpfsWithRewards extends ExtendedProposal {
  address: string;
  percentage: number | undefined;
  totalValueOfAllocations: BigNumber | undefined;
}

export default function useProposalsIpfsWithRewards(epoch?: number): {
  data: ProposalIpfsWithRewards[];
  isFetching: boolean;
} {
  const { data: proposalsAddresses, isFetching: isFetchingProposalsContract } =
    useProposalsContract(epoch);
  const { data: proposalsIpfs, isFetching: isFetchingProposalsIpfs } =
    useProposalsIpfs(proposalsAddresses);
  const { data: matchedProposalRewards, isFetching: isFetchingMatchedProposalRewards } =
    useMatchedProposalRewards(epoch);

  const proposalsWithRewards = (proposalsIpfs || []).map(proposal => {
    const proposalMatchedProposalRewards = matchedProposalRewards?.find(
      ({ address }) => address === proposal.address,
    );
    return {
      percentage: proposalMatchedProposalRewards?.percentage,
      totalValueOfAllocations: proposalMatchedProposalRewards?.sum,
      ...proposal,
    };
  });

  return {
    data: getSortedElementsByTotalValueOfAllocationsAndAlphabetical(proposalsWithRewards),
    isFetching:
      isFetchingProposalsContract || isFetchingProposalsIpfs || isFetchingMatchedProposalRewards,
  };
}
