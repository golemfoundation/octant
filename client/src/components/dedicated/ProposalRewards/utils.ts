import { BigNumber } from 'ethers';

export function getProgressPercentage(
  totalValueOfAllocations: BigNumber,
  cutOffValue: BigNumber,
): number {
  return totalValueOfAllocations.gt(0) && cutOffValue.gt(0)
    ? totalValueOfAllocations.mul(100).div(cutOffValue).toNumber()
    : 0;
}
