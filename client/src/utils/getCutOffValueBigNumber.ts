import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';

import getCutOffValueNumber from './getCutOffValueNumber';

const oneWei = parseFloat(formatUnits(BigNumber.from(1)));

export default function getCutOffValueBigNumber(
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
