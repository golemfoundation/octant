import useMatchedProjectRewards from 'hooks/queries/useMatchedProjectRewards';
import useProjectRewardsThreshold from 'hooks/queries/useProjectRewardsThreshold';

export default function useIsDonationAboveThreshold({
  proposalAddress,
  epoch,
  rewardsSumWithValueAndSimulation,
}: {
  epoch?: number;
  proposalAddress: string;
  rewardsSumWithValueAndSimulation?: bigint;
}): boolean {
  const { data: matchedProjectRewards } = useMatchedProjectRewards(epoch);
  const { data: projectRewardsThreshold } = useProjectRewardsThreshold(epoch);

  const proposalMatchedProposalRewards = matchedProjectRewards?.find(
    ({ address }) => address === proposalAddress,
  );

  const rewardsToUse = rewardsSumWithValueAndSimulation || proposalMatchedProposalRewards?.sum;

  if (projectRewardsThreshold === undefined || rewardsToUse === undefined) {
    return false;
  }

  return rewardsToUse >= projectRewardsThreshold;
}
