import useMatchedProposalRewards from './useMatchedProposalRewards';
import useProposalRewardsThresholdFraction from './useProposalRewardsThresholdFraction';

export default function useIsDonationAboveThreshold(proposalAddress: string): boolean {
  const { data: matchedProposalRewards } = useMatchedProposalRewards();
  const { data: proposalRewardsThresholdFraction } = useProposalRewardsThresholdFraction();

  const proposalMatchedProposalRewards = matchedProposalRewards?.find(
    ({ address }) => address === proposalAddress,
  );

  if (
    proposalRewardsThresholdFraction === undefined ||
    proposalMatchedProposalRewards === undefined
  ) {
    return false;
  }

  return proposalMatchedProposalRewards.percentage >= proposalRewardsThresholdFraction;
}
