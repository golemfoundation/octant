import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

export default function getRewardsSumWithValueAndSimulation(
  value: string,
  simulatedMatched?: string,
  proposalMatchedProposalRewardsSum?: BigNumber,
): BigNumber {
  return parseUnits(value)
    .add(simulatedMatched ? parseUnits(simulatedMatched, 'wei') : BigNumber.from(0))
    .add(proposalMatchedProposalRewardsSum || BigNumber.from(0));
}
