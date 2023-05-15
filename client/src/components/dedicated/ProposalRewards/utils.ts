import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';

export const oneWei = parseFloat(formatUnits(BigNumber.from(1)));

export function getCutOffValueNumber(
  individualProposalRewardsSum: BigNumber | undefined,
  proposalRewardsThresholdFraction: number | undefined,
): number {
  return individualProposalRewardsSum &&
    proposalRewardsThresholdFraction &&
    !individualProposalRewardsSum.isZero()
    ? parseFloat(formatUnits(individualProposalRewardsSum)) * proposalRewardsThresholdFraction
    : 0;
}

export function getCutOffValueBigNumber(
  individualProposalRewardsSum: BigNumber | undefined,
  proposalRewardsThresholdFraction: number | undefined,
): BigNumber {
  const cutOffValueNumber = getCutOffValueNumber(
    individualProposalRewardsSum,
    proposalRewardsThresholdFraction,
  );
  return cutOffValueNumber >= oneWei
    ? parseUnits(cutOffValueNumber.toFixed(18))
    : BigNumber.from(0);
}

export function getProgressPercentage(
  totalValueOfAllocations: BigNumber,
  cutOffValue: BigNumber,
): number {
  return totalValueOfAllocations.gt(0) && cutOffValue.gt(0)
    ? totalValueOfAllocations.mul(100).div(cutOffValue).toNumber()
    : 0;
}
