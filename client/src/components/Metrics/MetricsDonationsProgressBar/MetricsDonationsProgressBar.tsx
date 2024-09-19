import cx from 'classnames';
import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import ProgressBar from 'components/ui/ProgressBar';
import { dotAndZeroes } from 'utils/regExp';

import styles from './MetricsDonationsProgressBar.module.scss';
import MetricsDonationsProgressBarProps from './types';

const MetricsDonationsProgressBar: FC<MetricsDonationsProgressBarProps> = ({
  isDisabled,
  isLoading,
  donationsValue,
  compareValueLabel,
}) => {
  const { i18n } = useTranslation('translation');
  const donationsPercentage = isDisabled ? 0 : donationsValue.toFixed(2).replace(dotAndZeroes, '');
  const personalPercentage = isDisabled
    ? 0
    : (100 - donationsValue).toFixed(2).replace(dotAndZeroes, '');

  return (
    <div className={styles.root}>
      <ProgressBar
        className={styles.progressBar}
        progressPercentage={donationsValue}
        trackColor={isDisabled || isLoading ? 'grey' : 'orange'}
        variant="thin"
      />
      <div className={cx(styles.wrapper, isDisabled && styles.isDisabled)}>
        <div className={styles.donations}>
          {isLoading ? (
            <>
              <div className={styles.skeletonPercentage} />
              <div className={styles.skeletonLabel} />
            </>
          ) : (
            <>
              <div className={styles.percentage}>{donationsPercentage}%</div>
              <div className={styles.label}>{i18n.t('common.donations')}</div>
            </>
          )}
        </div>
        <div className={styles.personal}>
          {isLoading ? (
            <>
              <div className={styles.skeletonPercentage} />
              <div className={styles.skeletonLabel} />
            </>
          ) : (
            <>
              <div className={styles.percentage}>{personalPercentage}%</div>
              <div className={styles.label}>{compareValueLabel}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(MetricsDonationsProgressBar);
