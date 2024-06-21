import cx from 'classnames';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import ProgressBar from 'components/ui/ProgressBar';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import useIsDonationAboveThreshold from 'hooks/helpers/useIsDonationAboveThreshold';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useProjectRewardsThreshold from 'hooks/queries/useProjectRewardsThreshold';

import styles from './RewardsWithThreshold.module.scss';
import RewardsProps from './types';
import { getProgressPercentage } from './utils';

const RewardsWithThreshold: FC<RewardsProps> = ({
  address,
  className,
  epoch,
  isProjectView,
  numberOfDonors,
  totalValueOfAllocations,
}) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.projectRewards',
  });
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  const isArchivedProject = epoch !== undefined;

  const { data: projectRewardsThreshold, isFetching } = useProjectRewardsThreshold(epoch);
  const isDonationAboveThreshold = useIsDonationAboveThreshold({ epoch, projectAddress: address });
  const getValuesToDisplay = useGetValuesToDisplay();

  const totalValueOfAllocationsToDisplay = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    showCryptoSuffix: true,
    valueCrypto: totalValueOfAllocations,
  }).primary;

  const projectDonorsRewardsSumToDisplay = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    showCryptoSuffix: true,
    valueCrypto: totalValueOfAllocations,
  }).primary;

  const showProgressBar =
    !isDonationAboveThreshold &&
    projectRewardsThreshold !== undefined &&
    totalValueOfAllocations !== undefined;

  const leftSectionLabel = useMemo(() => {
    if (isDonationAboveThreshold && !isArchivedProject) {
      return t('currentTotal');
    }
    if (isDonationAboveThreshold && isArchivedProject) {
      return t('totalRaised');
    }
    return i18n.t('common.totalDonated');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isArchivedProject, isDonationAboveThreshold]);

  const rightSectionLabel = useMemo(() => {
    if (isDonationAboveThreshold && isArchivedProject && isProjectView) {
      return t('fundedIn');
    }
    if (isDonationAboveThreshold && isArchivedProject) {
      return i18n.t('common.donors');
    }
    if (isArchivedProject && isProjectView) {
      return t('didNotReachThreshold');
    }
    if (isArchivedProject) {
      return t('didNotReach');
    }
    return t('fundedAt');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isArchivedProject, isDonationAboveThreshold, isProjectView]);

  const rightSectionValueUseMemoDeps = [
    isArchivedProject,
    isDonationAboveThreshold,
    isProjectView,
    epoch,
    numberOfDonors,
    projectRewardsThreshold,
  ];

  const rightSectionValue = useMemo(() => {
    if (isDonationAboveThreshold && isArchivedProject && isProjectView) {
      return t('epoch', { epoch });
    }
    if (isDonationAboveThreshold && isArchivedProject) {
      return numberOfDonors;
    }
    return getValuesToDisplay({
      cryptoCurrency: 'ethereum',
      showCryptoSuffix: true,
      valueCrypto: projectRewardsThreshold,
    }).primary;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, rightSectionValueUseMemoDeps);

  return (
    <div className={cx(styles.root, className)} data-test="ProjectRewards">
      {showProgressBar ? (
        <ProgressBar
          className={styles.progressBar}
          color={isArchivedProject ? 'grey' : 'orange'}
          progressPercentage={getProgressPercentage(
            totalValueOfAllocations,
            projectRewardsThreshold,
          )}
          variant="ultraThin"
        />
      ) : (
        <div className={styles.divider} />
      )}
      <div className={styles.sections}>
        <div className={cx(styles.section, styles.leftSection)}>
          <div
            className={cx(styles.label, isFetching && styles.isFetching)}
            data-test="ProjectRewards__currentTotal__label"
          >
            {leftSectionLabel}
          </div>
          <div
            className={cx(
              styles.value,
              isDonationAboveThreshold && isArchivedProject && styles.greenValue,
              isDecisionWindowOpen &&
                !isDonationAboveThreshold &&
                !isArchivedProject &&
                styles.redValue,
              isFetching && styles.isFetching,
            )}
            data-test="ProjectRewards__currentTotal__number"
          >
            {isDonationAboveThreshold
              ? totalValueOfAllocationsToDisplay
              : projectDonorsRewardsSumToDisplay}
          </div>
        </div>
        {((!isArchivedProject && isDecisionWindowOpen && !isDonationAboveThreshold) ||
          !isDonationAboveThreshold ||
          isArchivedProject) && (
          <div className={cx(styles.section, styles.rightSection)}>
            <div className={cx(styles.label, isFetching && styles.isFetching)}>
              {rightSectionLabel}
            </div>
            <div className={cx(styles.value, isFetching && styles.isFetching)}>
              {rightSectionValue}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default RewardsWithThreshold;
