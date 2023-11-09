import cx from 'classnames';
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import ProgressBar from 'components/core/ProgressBar/ProgressBar';
import useIsDonationAboveThreshold from 'hooks/helpers/useIsDonationAboveThreshold';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposalDonors from 'hooks/queries/useProposalDonors';
import useProposalRewardsThreshold from 'hooks/queries/useProposalRewardsThreshold';
import getValueCryptoToDisplay from 'utils/getValueCryptoToDisplay';

import styles from './ProposalRewards.module.scss';
import ProposalRewardsProps from './types';
import { getProgressPercentage } from './utils';

const ProposalRewards: FC<ProposalRewardsProps> = ({
  address,
  className,
  epoch,
  isProposalView,
}) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.proposalRewards',
  });

  const isArchivedProposal = epoch !== undefined;

  const { data: proposalRewardsThreshold } = useProposalRewardsThreshold(epoch);
  const { data: matchedProposalRewards } = useMatchedProposalRewards(epoch);
  const { data: proposalDonors } = useProposalDonors(address, epoch);
  const proposalMatchedProposalRewards = matchedProposalRewards?.find(
    ({ address: proposalAddress }) => address === proposalAddress,
  );

  const proposalDonorsRewardsSum = isArchivedProposal
    ? proposalDonors?.reduce(
        (acc, curr) => acc.add(formatUnits(curr.amount, 'wei')),
        BigNumber.from(0),
      )
    : proposalMatchedProposalRewards?.sum;

  const isDonationAboveThreshold = useIsDonationAboveThreshold(address, epoch);

  const totalValueOfAllocationsToDisplay = getValueCryptoToDisplay({
    cryptoCurrency: 'ethereum',
    valueCrypto: proposalMatchedProposalRewards?.sum,
  });

  const proposalDonorsRewardsSumToDisplay = getValueCryptoToDisplay({
    cryptoCurrency: 'ethereum',
    valueCrypto: proposalDonorsRewardsSum,
  });

  const showProgressBar =
    !isDonationAboveThreshold &&
    proposalRewardsThreshold !== undefined &&
    proposalDonorsRewardsSum !== undefined;

  const leftSectionLabel = useMemo(() => {
    if (isDonationAboveThreshold && !isArchivedProposal) {
      return t('currentTotal');
    }
    if (isDonationAboveThreshold && isArchivedProposal) {
      return t('totalRaised');
    }
    return t('totalDonated');
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
    proposalDonors?.length,
    proposalRewardsThreshold?.toHexString(),
  ];

  const rightSectionValue = useMemo(() => {
    if (isDonationAboveThreshold && isArchivedProposal && isProposalView) {
      return t('epoch', { epoch });
    }
    if (isDonationAboveThreshold && isArchivedProposal) {
      return proposalDonors?.length;
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
          color={isArchivedProposal ? 'grey' : 'orange'}
          progressPercentage={getProgressPercentage(
            proposalDonorsRewardsSum,
            proposalRewardsThreshold,
          )}
        />
      ) : (
        <div className={styles.divider} />
      )}
      <div className={styles.sections}>
        <div className={cx(styles.section, styles.leftSection)}>
          <div className={styles.label} data-test="ProposalRewards__currentTotal__label">
            {leftSectionLabel}
          </div>
          <div
            className={cx(
              styles.value,
              isDonationAboveThreshold && isArchivedProposal && styles.greenValue,
              !isDonationAboveThreshold && !isArchivedProposal && styles.redValue,
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
            <div className={styles.label}>{rightSectionLabel}</div>
            <div className={styles.value}>{rightSectionValue}</div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ProposalRewards;
