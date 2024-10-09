import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './HomeGridRewardsEstimatorEstimates.module.scss';
import HomeGridRewardsEstimatorEstimatesProps from './types';

const HomeGridRewardsEstimatorEstimates: FC<HomeGridRewardsEstimatorEstimatesProps> = ({
  estimatedRewards,
  matchFunding,
  isLoading,
}) => {
  const { i18n } = useTranslation('translation');

  const dataTest = 'HomeGridRewardsEstimatorEstimates';

  return (
    <div className={styles.root} data-test={dataTest}>
      <div className={styles.column}>
        <div className={styles.label}>{i18n.t('common.rewards', { rewards: '' })}</div>

        <div className={styles.valueBox}>
          <div className={cx(styles.value, isLoading && styles.showSkeleton)}>
            {estimatedRewards ? estimatedRewards.primary : ''}
          </div>
        </div>
      </div>
      <div className={styles.column}>
        <div className={styles.label}> {i18n.t('common.matchFunding')}</div>
        <div className={styles.valueBox}>
          <div className={cx(styles.value, isLoading && styles.showSkeleton)}>
            {matchFunding ? matchFunding.primary : ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeGridRewardsEstimatorEstimates;
