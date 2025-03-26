import cx from 'classnames';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ModalProjectDonorsListFull from 'components/Project/ModalProjectDonorsListFull';
import ButtonAddToAllocate from 'components/shared/ButtonAddToAllocate';
import Button from 'components/ui/Button';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import useIdsInAllocation from 'hooks/helpers/useIdsInAllocation';
import useIsAllocatedTo from 'hooks/helpers/useIsAllocatedTo';
import useIsDonationAboveThreshold from 'hooks/helpers/useIsDonationAboveThreshold';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useAllocationsStore from 'store/allocations/store';

import styles from './Rewards.module.scss';
import RewardsProps from './types';

const Rewards: FC<RewardsProps> = ({
  address,
  className,
  epoch,
  numberOfDonors,
  totalValueOfAllocations,
  matchedRewards,
  donations,
  showMoreInfo = false,
  variant,
}) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.projectRewards',
  });
  const [isFullDonorsListModalOpen, setIsFullDonorsListModalOpen] = useState<boolean>(false);
  const { isLargeDesktop, isDesktop, isMobile } = useMediaQuery();
  const getValuesToDisplay = useGetValuesToDisplay();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: userAllocations } = useUserAllocations(epoch);
  const isDonationAboveThreshold = useIsDonationAboveThreshold({ epoch, projectAddress: address });

  const { allocations, addAllocations, removeAllocations } = useAllocationsStore(state => ({
    addAllocations: state.addAllocations,
    allocations: state.data.allocations,
    removeAllocations: state.removeAllocations,
  }));
  const { onAddRemoveFromAllocate } = useIdsInAllocation({
    addAllocations,
    allocations: allocations!,
    isDecisionWindowOpen,
    removeAllocations,
    userAllocationsElements: userAllocations?.elements,
  });

  const isAllocatedTo = useIsAllocatedTo(
    address,
    allocations,
    epoch!,
    isDecisionWindowOpen!,
    userAllocations,
  );

  const isArchivedProject = epoch !== undefined;

  const currentTotalIncludingMFForProjectsAboveThresholdToDisplay = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    getFormattedEthValueProps: {
      numberOfDecimalPlaces: 3,
    },
    showCryptoSuffix: true,
    valueCrypto: totalValueOfAllocations,
  }).primary;

  const matchFundingToDisplay = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    getFormattedEthValueProps: {
      numberOfDecimalPlaces: 3,
    },
    showCryptoSuffix: true,
    valueCrypto: matchedRewards,
  }).primary;

  const donationsToDisplay = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    getFormattedEthValueProps: {
      numberOfDecimalPlaces: 3,
    },
    showCryptoSuffix: true,
    valueCrypto: donations,
  }).primary;

  const leftSectionLabel = useMemo(() => {
    if (!isDonationAboveThreshold) {
      return i18n.t('common.totalDonated');
    }
    if (!isArchivedProject) {
      return t('currentTotal');
    }
    if (isArchivedProject) {
      return t('totalRaised');
    }
    return i18n.t('common.totalDonated');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isArchivedProject, i18n.language]);

  const showMiddleSections = showMoreInfo && (isLargeDesktop || isDesktop);

  return (
    <div className={className}>
      <div className={cx(styles.root, styles[`variant--${variant}`])} data-test="ProjectRewards">
        {variant === 'projectsView' && <div className={styles.horizontalDivider} />}
        <div className={styles.sections}>
          <div className={cx(styles.section, styles[`variant--${variant}`])}>
            <div className={styles.label} data-test="ProjectRewards__currentTotal__label">
              {leftSectionLabel}
            </div>
            <div
              className={cx(
                styles.value,
                isDonationAboveThreshold && styles.isDonationAboveThreshold,
              )}
              data-test="ProjectRewards__currentTotal__number"
            >
              {currentTotalIncludingMFForProjectsAboveThresholdToDisplay}
            </div>
          </div>
          {variant === 'projectView' && <div className={cx(styles.verticalDivider)} />}
          {showMiddleSections && (
            <>
              <div className={cx(styles.section, styles[`variant--${variant}`])}>
                <div className={styles.container}>
                  <div
                    className={styles.label}
                    data-test="ProjectRewards__donationsToDisplay__label"
                  >
                    {i18n.t('common.donations')}
                  </div>
                  <div
                    className={cx(
                      styles.value,
                      isDonationAboveThreshold && styles.isDonationAboveThreshold,
                    )}
                  >
                    {donationsToDisplay}
                  </div>
                </div>
              </div>
              {variant === 'projectView' && <div className={cx(styles.verticalDivider)} />}
              <div className={cx(styles.section, styles[`variant--${variant}`])}>
                <div className={styles.container}>
                  <div className={styles.label} data-test="ProjectRewards__matchFunding__label">
                    {i18n.t('common.matchFunding')}
                  </div>
                  <div
                    className={cx(
                      styles.value,
                      isDonationAboveThreshold && styles.isDonationAboveThreshold,
                    )}
                  >
                    {matchFundingToDisplay}
                  </div>
                </div>
              </div>
            </>
          )}
          {variant === 'projectView' && <div className={cx(styles.verticalDivider)} />}
          <div
            className={cx(styles.section, styles[`variant--${variant}`], styles.donorsSection)}
            data-test="ProjectRewards__donors"
            onClick={isMobile ? () => {} : () => setIsFullDonorsListModalOpen(true)}
          >
            <div className={styles.label}>{i18n.t('common.donors')}</div>
            <div
              className={cx(
                styles.value,
                isDonationAboveThreshold && styles.isDonationAboveThreshold,
              )}
            >
              {numberOfDonors}
            </div>
          </div>
        </div>
      </div>
      {variant === 'projectView' && (
        <div className={styles.buttons}>
          <ButtonAddToAllocate
            dataTest="ProjectListItemHeader__ButtonAddToAllocate"
            isAddedToAllocate={allocations.includes(address)}
            isAllocatedTo={isAllocatedTo}
            isArchivedProject={isArchivedProject}
            onClick={() => onAddRemoveFromAllocate(address)}
            variant="cta"
          />
          <Button
            dataTest="ProjectRewards__Button--donors"
            label={t('viewAllDonors')}
            onClick={() => setIsFullDonorsListModalOpen(true)}
            variant="secondary"
          />
        </div>
      )}
      {address && (
        <ModalProjectDonorsListFull
          modalProps={{
            isOpen: isFullDonorsListModalOpen,
            onClosePanel: () => setIsFullDonorsListModalOpen(false),
          }}
          projectAddress={address}
        />
      )}
    </div>
  );
};
export default Rewards;
