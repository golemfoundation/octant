import i18n from 'i18n';
import getFormattedEthValue from 'utils/getFormattedEthValue';

export function getIndividualRewardText({
  individualReward,
  currentEpoch,
  isDecisionWindowOpen,
}: {
  currentEpoch?: number;
  individualReward?: bigint;
  isDecisionWindowOpen?: boolean;
}): string {
  if (currentEpoch === 1 || individualReward === 0n || !isDecisionWindowOpen) {
    return i18n.t('layouts.main.noRewardsYet');
  }
  if (currentEpoch === undefined || individualReward === undefined) {
    return i18n.t('layouts.main.loadingRewardBudget');
  }
  return i18n.t('common.rewards', {
    rewards: getFormattedEthValue({ value: individualReward }).fullString,
  });
}
