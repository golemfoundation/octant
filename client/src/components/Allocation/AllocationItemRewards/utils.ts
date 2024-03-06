export function getFilled(
  proposalRewardsThreshold?: bigint,
  rewardsSumWithValueAndSimulation?: bigint,
): number {
  if (
    !proposalRewardsThreshold ||
    !rewardsSumWithValueAndSimulation ||
    rewardsSumWithValueAndSimulation === 0n
  ) {
    return 0;
  }
  return rewardsSumWithValueAndSimulation > proposalRewardsThreshold
    ? 100
    : (parseFloat(rewardsSumWithValueAndSimulation.toString()) * 100) /
        parseFloat(proposalRewardsThreshold.toString());
}
