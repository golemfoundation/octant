import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

export default function getCutOffValueNumber(
  individualProposalRewardsSum: BigNumber | undefined,
  proposalRewardsThresholdFraction: number | undefined,
): number {
  return individualProposalRewardsSum &&
    proposalRewardsThresholdFraction &&
    !individualProposalRewardsSum.isZero()
    ? parseFloat(formatUnits(individualProposalRewardsSum)) * proposalRewardsThresholdFraction
    : 0;
}
