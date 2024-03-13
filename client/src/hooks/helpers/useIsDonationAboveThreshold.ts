import useMatchedProjectRewards from 'hooks/queries/useMatchedProjectRewards';
import useProjectRewardsThreshold from 'hooks/queries/useProjectRewardsThreshold';

export default function useIsDonationAboveThreshold({
  projectAddress,
  epoch,
  rewardsSumWithValueAndSimulation,
}: {
  epoch?: number;
  projectAddress: string;
  rewardsSumWithValueAndSimulation?: bigint;
}): boolean {
  const { data: matchedProjectRewards } = useMatchedProjectRewards(epoch);
  const { data: projectRewardsThreshold } = useProjectRewardsThreshold(epoch);

  const projectMatchedProjectRewards = matchedProjectRewards?.find(
    ({ address }) => address === projectAddress,
  );

  const rewardsToUse = rewardsSumWithValueAndSimulation || projectMatchedProjectRewards?.sum;

  if (projectRewardsThreshold === undefined || rewardsToUse === undefined) {
    return false;
  }

  return rewardsToUse >= projectRewardsThreshold;
}
