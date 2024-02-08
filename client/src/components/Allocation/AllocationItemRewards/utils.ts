import { BigNumber } from 'ethers';

export function getFilled(
  proposalRewardsThreshold?: BigNumber,
  rewardsSumWithValueAndSimulation?: BigNumber,
): number {
  if (
    !proposalRewardsThreshold ||
    !rewardsSumWithValueAndSimulation ||
    rewardsSumWithValueAndSimulation.isZero()
  ) {
    return 0;
  }
  return rewardsSumWithValueAndSimulation.gt(proposalRewardsThreshold)
    ? 100
    : (parseFloat(rewardsSumWithValueAndSimulation.toString()) * 100) /
        parseFloat(proposalRewardsThreshold.toString());
}
