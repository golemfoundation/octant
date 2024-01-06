import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

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

export function getRewardsSumWithValueAndSimulation(
  value: string,
  simulatedMatched?: string,
  proposalMatchedProposalRewardsSum?: BigNumber,
): BigNumber {
  return parseUnits(value)
    .add(simulatedMatched ? parseUnits(simulatedMatched, 'wei') : BigNumber.from(0))
    .add(proposalMatchedProposalRewardsSum || BigNumber.from(0));
}
