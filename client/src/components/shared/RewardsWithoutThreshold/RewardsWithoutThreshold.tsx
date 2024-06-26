import cx from 'classnames';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';

import styles from './RewardsWithoutThreshold.module.scss';
import RewardsWithoutThresholdProps from './types';

const RewardsWithoutThreshold: FC<RewardsWithoutThresholdProps> = ({
  className,
  epoch,
  numberOfDonors,
  totalValueOfAllocations,
}) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.projectRewards',
  });
  const getValuesToDisplay = useGetValuesToDisplay();

  const isArchivedProject = epoch !== undefined;

  const currentTotalIncludingMFForProjectsAboveThreshold = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    showCryptoSuffix: true,
    valueCrypto: totalValueOfAllocations,
  });

  const leftSectionLabel = useMemo(() => {
    if (!isArchivedProject) {
      return t('currentTotal');
    }
    if (isArchivedProject) {
      return t('totalRaised');
    }
    return i18n.t('common.totalDonated');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isArchivedProject]);

  return (
    <div className={cx(styles.root, className)} data-test="ProjectRewards">
      <div className={styles.divider} />
      <div className={styles.sections}>
        <div className={cx(styles.section, styles.leftSection)}>
          <div className={styles.label} data-test="ProjectRewards__currentTotal__label">
            {leftSectionLabel}
          </div>
          <div className={styles.value} data-test="ProjectRewards__currentTotal__number">
            {currentTotalIncludingMFForProjectsAboveThreshold.primary}
          </div>
        </div>
        <div className={cx(styles.section, styles.rightSection)}>
          <div className={styles.label}>{i18n.t('common.donors')}</div>
          <div className={styles.value}>{numberOfDonors}</div>
        </div>
      </div>
    </div>
  );
};
export default RewardsWithoutThreshold;
