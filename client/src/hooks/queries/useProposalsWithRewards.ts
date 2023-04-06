import { BigNumber } from 'ethers';

import getSortedElementsByTotalValueOfAllocations from 'utils/getSortedElementsByTotalValueOfAllocations';

import useCurrentEpoch from './useCurrentEpoch';
import useMatchedProposalRewards from './useMatchedProposalRewards';
import useProposalsContract from './useProposalsContract';

export interface ProposalWithRewards {
  address: string;
  percentage: number | undefined;
  totalValueOfAllocations: BigNumber | undefined;
}

export default function useProposalsWithRewards(): ProposalWithRewards[] {
  const { data: proposalsAddresses } = useProposalsContract();
  const { data: matchedProposalRewards } = useMatchedProposalRewards();
  const { data: currentEpoch } = useCurrentEpoch();

  const proposalsWithRewards = (proposalsAddresses || []).map(proposalAddress => {
    const proposalMatchedProposalRewards = matchedProposalRewards?.find(
      ({ address }) => address === proposalAddress,
    );
    return {
      address: proposalAddress,
      percentage: proposalMatchedProposalRewards?.percentage,
      totalValueOfAllocations: proposalMatchedProposalRewards?.sum,
    };
  });

  return !!currentEpoch && currentEpoch > 1 && matchedProposalRewards
    ? getSortedElementsByTotalValueOfAllocations(proposalsWithRewards)
    : proposalsWithRewards;
}
