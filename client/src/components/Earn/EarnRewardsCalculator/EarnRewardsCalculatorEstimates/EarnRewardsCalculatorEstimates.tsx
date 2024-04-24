import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './EarnRewardsCalculatorEstimates.module.scss';
import { EarnRewardsCalculatorEstimatesProps } from './types';

const EarnRewardsCalculatorEstimates: FC<EarnRewardsCalculatorEstimatesProps> = ({
  rewardsFiat,
  matchFundingFiat,
  isLoading,
}) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.rewardsCalculator',
  });

  return (
    <div className={styles.root}>
      <div className={styles.estimatesLabel}>{t('estimates')}</div>
      <div className={styles.estimates}>
        <div className={styles.row}>
          <div className={styles.label}>{i18n.t('common.rewards', { rewards: '' })}</div>
          <div className={cx(styles.value, isLoading && styles.showSkeleton)}>{rewardsFiat}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}> {i18n.t('common.matchFunding')}</div>
          <div className={cx(styles.value, isLoading && styles.showSkeleton)}>
            {matchFundingFiat}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarnRewardsCalculatorEstimates;
