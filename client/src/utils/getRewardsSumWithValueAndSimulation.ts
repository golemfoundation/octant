import { parseUnitsBigInt } from './parseUnitsBigInt';

export default function getRewardsSumWithValueAndSimulation(
  value: string,
  simulatedMatchedBigInt: bigint,
  projectMatchedProjectRewardsAllocated?: bigint,
  userAllocationToThisProject?: bigint,
  uqScore?: bigint,
): bigint {
  const userAllocationToThisProjectMultiplied =
    userAllocationToThisProject && uqScore
      ? (userAllocationToThisProject * uqScore) / 100n
      : BigInt(0);

  return (
    parseUnitsBigInt(value) +
    simulatedMatchedBigInt -
    (userAllocationToThisProjectMultiplied || BigInt(0)) +
    (projectMatchedProjectRewardsAllocated || BigInt(0))
  );
}
