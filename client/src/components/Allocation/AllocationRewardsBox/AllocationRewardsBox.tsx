import cx from 'classnames';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useUpcomingBudget from 'hooks/queries/useUpcomingBudget';

import styles from './AllocationRewardsBox.module.scss';
import AllocationRewardsBoxProps from './types';

const AllocationRewardsBox: FC<AllocationRewardsBoxProps> = ({ isDisabled, isLocked }) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.allocationRewardsBox',
  });
  const { data: individualReward } = useIndividualReward();
  const { data: upcomingBudget } = useUpcomingBudget();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const getValuesToDisplay = useGetValuesToDisplay();

  const hasUserIndividualReward = !!individualReward && individualReward !== 0n;
  const isDecisionWindowOpenAndHasIndividualReward =
    hasUserIndividualReward && isDecisionWindowOpen;

  const subtitle = useMemo(() => {
    if (isDecisionWindowOpen === false && upcomingBudget) {
      return t('availableDuringAllocation');
    }
    if (isLocked) {
      return t('allocated');
    }
    if (isDecisionWindowOpenAndHasIndividualReward) {
      return i18n.t('common.availableNow');
    }
    return t('subtitleNoRewards');
  }, [
    isLocked,
    isDecisionWindowOpenAndHasIndividualReward,
    upcomingBudget,
    isDecisionWindowOpen,
    t,
    i18n,
  ]);

  const budget = useMemo(() => {
    if (isDecisionWindowOpen) {
      return individualReward;
    }
    if (isDecisionWindowOpen === false && upcomingBudget) {
      return upcomingBudget;
    }
    return BigInt(0);
  }, [isDecisionWindowOpen, individualReward, upcomingBudget]);

  return (
    <div className={styles.root}>
      <div className={cx(styles.value, (isDisabled || isLocked) && styles.isGrey)}>
        {
          getValuesToDisplay({
            cryptoCurrency: 'ethereum',
            showCryptoSuffix: true,
            showLessThanOneCentFiat: !isDisabled,
            valueCrypto: budget,
          }).primary
        }
      </div>
      <div className={styles.label}>{subtitle}</div>
    </div>
  );
};

export default AllocationRewardsBox;
