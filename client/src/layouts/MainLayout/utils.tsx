import { BigNumber } from 'ethers';

import i18n from 'i18n';
import getFormattedEthValue from 'utils/getFormattedEthValue';

export function getIndividualRewardText({
  individualReward,
  currentEpoch,
  isDecisionWindowOpen,
}: {
  currentEpoch?: number;
  individualReward?: BigNumber;
  isDecisionWindowOpen?: boolean;
}): string {
  if (currentEpoch === 1 || individualReward?.isZero() || !isDecisionWindowOpen) {
    return i18n.t('layouts.main.noRewardsYet');
  }
  if (currentEpoch === undefined || individualReward === undefined) {
    return i18n.t('layouts.main.loadingRewardBudget');
  }
  return i18n.t('common.budget', {
    rewards: getFormattedEthValue(individualReward).fullString,
  });
}
