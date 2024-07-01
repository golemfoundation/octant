export function getProgressPercentage(
  totalValueOfAllocations: bigint,
  cutOffValue: bigint,
): number {
  return totalValueOfAllocations > 0 && cutOffValue > 0
    ? Number((totalValueOfAllocations * 100n) / cutOffValue)
    : 0;
}
