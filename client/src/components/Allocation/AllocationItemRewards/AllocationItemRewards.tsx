import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import useIsDonationAboveThreshold from 'hooks/helpers/useIsDonationAboveThreshold';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposalRewardsThreshold from 'hooks/queries/useProposalRewardsThreshold';
import getFormattedEthValue from 'utils/getFormattedEthValue';

import styles from './AllocationItemRewards.module.scss';
import AllocationItemProposalRewardsProps from './types';

const AllocationItemProposalRewards: FC<AllocationItemProposalRewardsProps> = ({
  className,
  address,
}) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'views.allocation.allocationItem',
  });
  const { isDesktop } = useMediaQuery();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: matchedProposalRewards } = useMatchedProposalRewards();
  const { data: proposalRewardsThreshold } = useProposalRewardsThreshold();

  const isDonationAboveThreshold = useIsDonationAboveThreshold(address);
  const isEpoch1 = currentEpoch === 1;

  const proposalMatchedProposalRewards = matchedProposalRewards?.find(
    ({ address: matchedProposalRewardsAddress }) => address === matchedProposalRewardsAddress,
  );

  // Before the first allocation, threshold is 0, which should be mapped to not defined.
  const isRewardsDataDefined =
    proposalMatchedProposalRewards !== undefined &&
    proposalRewardsThreshold !== undefined &&
    !proposalRewardsThreshold?.isZero();

  const isThresholdUnknown = isEpoch1 || !isRewardsDataDefined;

  const proposalMatchedProposalRewardsFormatted = proposalMatchedProposalRewards
    ? getFormattedEthValue(proposalMatchedProposalRewards?.sum)
    : undefined;
  const proposalRewardsThresholdFormatted = proposalRewardsThreshold
    ? getFormattedEthValue(proposalRewardsThreshold)
    : undefined;
  const areSuffixesTheSame =
    proposalMatchedProposalRewardsFormatted?.suffix === proposalRewardsThresholdFormatted?.suffix;

  return (
    <div
      className={cx(
        styles.root,
        className,
        (isEpoch1 || isThresholdUnknown) && styles.isThresholdUnknown,
      )}
    >
      {isEpoch1 && t('epoch1')}
      {!isEpoch1 &&
        !isRewardsDataDefined &&
        i18n.t(isDesktop ? 'common.thresholdDataUnavailable' : 'common.noThresholdData')}
      {!isEpoch1 && isRewardsDataDefined && (
        <div className={styles.threshold}>
          {isDonationAboveThreshold ? (
            t('thresholdReached', {
              sum: proposalMatchedProposalRewardsFormatted?.fullString,
            })
          ) : (
            <Trans
              components={[<span className={styles.donationBelowThreshold} />]}
              i18nKey="views.allocation.allocationItem.standard"
              values={{
                sum: areSuffixesTheSame
                  ? proposalMatchedProposalRewardsFormatted?.value
                  : proposalMatchedProposalRewardsFormatted?.fullString,
                threshold: getFormattedEthValue(proposalRewardsThreshold).fullString,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AllocationItemProposalRewards;
