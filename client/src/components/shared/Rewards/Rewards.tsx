import cx from 'classnames';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import ProgressBar from 'components/ui/ProgressBar';
import useIsDonationAboveThreshold from 'hooks/helpers/useIsDonationAboveThreshold';
import useProposalRewardsThreshold from 'hooks/queries/useProposalRewardsThreshold';
import getValueCryptoToDisplay from 'utils/getValueCryptoToDisplay';

import styles from './Rewards.module.scss';
import RewardsProps from './types';
import { getProgressPercentage } from './utils';

const Rewards: FC<RewardsProps> = ({
  address,
  className,
  epoch,
  isProposalView,
  numberOfDonors,
  totalValueOfAllocations,
}) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.proposalRewards',
  });

  const isArchivedProposal = epoch !== undefined;

  const { data: proposalRewardsThreshold, isFetching } = useProposalRewardsThreshold(epoch);
  const isDonationAboveThreshold = useIsDonationAboveThreshold({ epoch, proposalAddress: address });

  const totalValueOfAllocationsToDisplay = getValueCryptoToDisplay({
    cryptoCurrency: 'ethereum',
    shouldIgnoreGwei: true,
    valueCrypto: totalValueOfAllocations,
  });

  const proposalDonorsRewardsSumToDisplay = getValueCryptoToDisplay({
    cryptoCurrency: 'ethereum',
    valueCrypto: totalValueOfAllocations,
  });

  const showProgressBar =
    !isDonationAboveThreshold &&
    proposalRewardsThreshold !== undefined &&
    totalValueOfAllocations !== undefined;

  const leftSectionLabel = useMemo(() => {
    if (isDonationAboveThreshold && !isArchivedProposal) {
      return t('currentTotal');
    }
    if (isDonationAboveThreshold && isArchivedProposal) {
      return t('totalRaised');
    }
    return i18n.t('common.totalDonated');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isArchivedProposal, isDonationAboveThreshold]);

  const rightSectionLabel = useMemo(() => {
    if (isDonationAboveThreshold && isArchivedProposal && isProposalView) {
      return t('fundedIn');
    }
    if (isDonationAboveThreshold && isArchivedProposal) {
      return i18n.t('common.donors');
    }
    if (isArchivedProposal && isProposalView) {
      return t('didNotReachThreshold');
    }
    if (isArchivedProposal) {
      return t('didNotReach');
    }
    return t('fundedAt');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isArchivedProposal, isDonationAboveThreshold, isProposalView]);

  const rightSectionValueUseMemoDeps = [
    isArchivedProposal,
    isDonationAboveThreshold,
    isProposalView,
    epoch,
    numberOfDonors,
    proposalRewardsThreshold?.toHexString(),
  ];

  const rightSectionValue = useMemo(() => {
    if (isDonationAboveThreshold && isArchivedProposal && isProposalView) {
      return t('epoch', { epoch });
    }
    if (isDonationAboveThreshold && isArchivedProposal) {
      return numberOfDonors;
    }
    return getValueCryptoToDisplay({
      cryptoCurrency: 'ethereum',
      valueCrypto: proposalRewardsThreshold,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, rightSectionValueUseMemoDeps);

  return (
    <div className={cx(styles.root, className)} data-test="ProposalRewards">
      {showProgressBar ? (
        <ProgressBar
          className={styles.progressBar}
          color={isArchivedProposal ? 'grey' : 'orange'}
          progressPercentage={getProgressPercentage(
            totalValueOfAllocations,
            proposalRewardsThreshold,
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
            data-test="ProposalRewards__currentTotal__label"
          >
            {leftSectionLabel}
          </div>
          <div
            className={cx(
              styles.value,
              isDonationAboveThreshold && isArchivedProposal && styles.greenValue,
              !isDonationAboveThreshold && !isArchivedProposal && styles.redValue,
              isFetching && styles.isFetching,
            )}
            data-test="ProposalRewards__currentTotal__number"
          >
            {isDonationAboveThreshold
              ? totalValueOfAllocationsToDisplay
              : proposalDonorsRewardsSumToDisplay}
          </div>
        </div>
        {!(isDonationAboveThreshold && !isArchivedProposal) && (
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
export default Rewards;
