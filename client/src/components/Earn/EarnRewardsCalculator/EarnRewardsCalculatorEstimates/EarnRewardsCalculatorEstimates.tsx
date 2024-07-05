import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './EarnRewardsCalculatorEstimates.module.scss';
import { EarnRewardsCalculatorEstimatesProps } from './types';

const EarnRewardsCalculatorEstimates: FC<EarnRewardsCalculatorEstimatesProps> = ({
  estimatedRewards,
  matchFunding,
  isLoading,
}) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.rewardsCalculator',
  });

  const dataTest = 'EarnRewardsCalculatorEstimates';

  return (
    <div className={styles.root} data-test={dataTest}>
      <div className={styles.estimatesLabel} data-test={`${dataTest}__label`}>
        {t('estimates')}
      </div>
      <div className={styles.estimates}>
        <div className={styles.row} data-test={`${dataTest}__rewards`}>
          <div className={styles.label} data-test={`${dataTest}__rewardsLabel`}>
            {i18n.t('common.rewards', { rewards: '' })}
          </div>
          <div
            className={cx(styles.value, isLoading && styles.showSkeleton)}
            data-test={`${dataTest}__rewardsFiat${isLoading ? '--skeleton' : ''}`}
          >
            {estimatedRewards.primary}
          </div>
        </div>
        <div className={styles.row} data-test={`${dataTest}__matchFunding`}>
          <div className={styles.label} data-test={`${dataTest}__matchFundingLabel`}>
            {i18n.t('common.matchFunding')}
          </div>
          <div
            className={cx(styles.value, isLoading && styles.showSkeleton)}
            data-test={`${dataTest}__matchFundingFiat${isLoading ? '--skeleton' : ''}`}
          >
            {matchFunding.primary}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarnRewardsCalculatorEstimates;
