import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposalRewardsThreshold from 'hooks/queries/useProposalRewardsThreshold';

export default function useIsDonationAboveThreshold(proposalAddress: string): boolean {
  const { data: matchedProposalRewards } = useMatchedProposalRewards();
  const { data: proposalRewardsThreshold } = useProposalRewardsThreshold();

  const proposalMatchedProposalRewards = matchedProposalRewards?.find(
    ({ address }) => address === proposalAddress,
  );

  if (proposalRewardsThreshold === undefined || proposalMatchedProposalRewards === undefined) {
    return false;
  }

  return proposalMatchedProposalRewards.sum.gte(proposalRewardsThreshold);
}
