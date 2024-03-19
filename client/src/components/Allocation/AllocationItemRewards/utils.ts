export function getFilled(
  projectRewardsThreshold?: bigint,
  rewardsSumWithValueAndSimulation?: bigint,
): number {
  if (
    !projectRewardsThreshold ||
    !rewardsSumWithValueAndSimulation ||
    rewardsSumWithValueAndSimulation === 0n
  ) {
    return 0;
  }
  return rewardsSumWithValueAndSimulation > projectRewardsThreshold
    ? 100
    : (parseFloat(rewardsSumWithValueAndSimulation.toString()) * 100) /
        parseFloat(projectRewardsThreshold.toString());
}
