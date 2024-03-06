import { parseUnitsBigInt } from './parseUnitsBigInt';

export default function getRewardsSumWithValueAndSimulation(
  value: string,
  simulatedMatched?: string,
  proposalMatchedProposalRewardsAllocated?: bigint,
  userAllocationToThisProject?: bigint,
): bigint {
  return (
    parseUnitsBigInt(value) +
    (simulatedMatched ? parseUnitsBigInt(simulatedMatched, 'wei') : BigInt(0)) -
    (userAllocationToThisProject || BigInt(0)) +
    (proposalMatchedProposalRewardsAllocated || BigInt(0))
  );
}
