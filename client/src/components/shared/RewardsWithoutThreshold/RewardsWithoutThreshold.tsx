import cx from 'classnames';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import useMediaQuery from 'hooks/helpers/useMediaQuery';

import styles from './RewardsWithoutThreshold.module.scss';
import RewardsWithoutThresholdProps from './types';

const RewardsWithoutThreshold: FC<RewardsWithoutThresholdProps> = ({
  className,
  epoch,
  numberOfDonors,
  totalValueOfAllocations,
  matchedRewards,
  donations,
  showMoreInfo,
}) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.projectRewards',
  });
  const { isLargeDesktop, isDesktop } = useMediaQuery();
  const getValuesToDisplay = useGetValuesToDisplay();

  const isArchivedProject = epoch !== undefined;

  const currentTotalIncludingMFForProjectsAboveThresholdToDisplay = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    showCryptoSuffix: true,
    valueCrypto: totalValueOfAllocations,
  }).primary;

  const matchFundingToDisplay = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    showCryptoSuffix: true,
    valueCrypto: matchedRewards,
  }).primary;

  const donationsToDisplay = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    showCryptoSuffix: true,
    valueCrypto: donations,
  }).primary;

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

  const showVerticalDividers = showMoreInfo && (isLargeDesktop || isDesktop);

  return (
    <div className={cx(styles.root, className)} data-test="ProjectRewards">
      <div className={styles.divider} />
      <div className={cx(styles.sections, showVerticalDividers && styles.showVerticalDividers)}>
        <div className={cx(styles.section, styles.leftSection)}>
          <div className={styles.label} data-test="ProjectRewards__currentTotal__label">
            {leftSectionLabel}
          </div>
          <div className={styles.value} data-test="ProjectRewards__currentTotal__number">
            {currentTotalIncludingMFForProjectsAboveThresholdToDisplay}
          </div>
        </div>
        {showMoreInfo && (
          <>
            <div className={styles.section}>
              <div className={styles.container}>
                <div className={styles.label}>{i18n.t('common.donations')}</div>
                <div className={styles.value}>{donationsToDisplay}</div>
              </div>
            </div>
            <div className={styles.section}>
              <div className={styles.container}>
                <div className={styles.label}>{i18n.t('common.matchFunding')}</div>
                <div className={styles.value}>{matchFundingToDisplay}</div>
              </div>
            </div>
          </>
        )}
        <div className={cx(styles.section, styles.rightSection)}>
          <div className={styles.label}>{i18n.t('common.donors')}</div>
          <div className={styles.value}>{numberOfDonors}</div>
        </div>
      </div>
    </div>
  );
};
export default RewardsWithoutThreshold;
