import { BigNumber } from 'ethers';

import i18n from 'i18n';
import getFormattedEthValue from 'utils/getFormattedEthValue';

export function getIndividualRewardText({
  individualReward,
  currentEpoch,
}: {
  currentEpoch?: number;
  individualReward?: BigNumber;
}): string {
  if (currentEpoch !== undefined && currentEpoch === 1) {
    return i18n.t('layouts.main.noRewardBudgetYet');
  }
  if (currentEpoch === undefined || individualReward === undefined) {
    return i18n.t('layouts.main.loadingRewardBudget');
  }
  if (individualReward.isZero()) {
    return i18n.t('layouts.main.noRewardBudgetYet');
  }
  return i18n.t('common.budget', {
    budget: getFormattedEthValue(individualReward).fullString,
  });
}
