import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposalRewardsThreshold from 'hooks/queries/useProposalRewardsThreshold';

export default function useIsDonationAboveThreshold(
  proposalAddress: string,
  epoch?: number,
): boolean {
  const { data: matchedProposalRewards } = useMatchedProposalRewards(epoch);
  const { data: proposalRewardsThreshold } = useProposalRewardsThreshold(epoch);

  const proposalMatchedProposalRewards = matchedProposalRewards?.find(
    ({ address }) => address === proposalAddress,
  );

  if (proposalRewardsThreshold === undefined || proposalMatchedProposalRewards === undefined) {
    return false;
  }

  return proposalMatchedProposalRewards.sum.gte(proposalRewardsThreshold);
}
