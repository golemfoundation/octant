import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposalRewardsThreshold from 'hooks/queries/useProposalRewardsThreshold';

export default function useIsDonationAboveThreshold({
  proposalAddress,
  epoch,
  rewardsSumWithValueAndSimulation,
}: {
  epoch?: number;
  proposalAddress: string;
  rewardsSumWithValueAndSimulation?: bigint;
}): boolean {
  const { data: matchedProposalRewards } = useMatchedProposalRewards(epoch);
  const { data: proposalRewardsThreshold } = useProposalRewardsThreshold(epoch);

  const proposalMatchedProposalRewards = matchedProposalRewards?.find(
    ({ address }) => address === proposalAddress,
  );

  const rewardsToUse = rewardsSumWithValueAndSimulation || proposalMatchedProposalRewards?.sum;

  if (proposalRewardsThreshold === undefined || rewardsToUse === undefined) {
    return false;
  }

  return rewardsToUse >= proposalRewardsThreshold;
}
