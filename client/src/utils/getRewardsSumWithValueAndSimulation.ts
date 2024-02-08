import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

export default function getRewardsSumWithValueAndSimulation(
  value: string,
  simulatedMatched?: string,
  proposalMatchedProposalRewardsAllocated?: BigNumber,
  userAllocationToThisProject?: BigNumber,
): BigNumber {
  return parseUnits(value)
    .add(simulatedMatched ? parseUnits(simulatedMatched, 'wei') : BigNumber.from(0))
    .sub(userAllocationToThisProject || BigNumber.from(0))
    .add(proposalMatchedProposalRewardsAllocated || BigNumber.from(0));
}
