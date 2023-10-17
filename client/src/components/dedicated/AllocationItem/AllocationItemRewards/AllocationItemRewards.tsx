import cx from 'classnames';
import React, { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import useIsDonationAboveThreshold from 'hooks/helpers/useIsDonationAboveThreshold';
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
  const { data: currentEpoch } = useCurrentEpoch();
  const isEpoch1 = currentEpoch === 1;
  const { data: matchedProposalRewards } = useMatchedProposalRewards();
  const { data: proposalRewardsThreshold } = useProposalRewardsThreshold();

  const isDonationAboveThreshold = useIsDonationAboveThreshold(address);

  const proposalMatchedProposalRewards = matchedProposalRewards?.find(
    ({ address: matchedProposalRewardsAddress }) => address === matchedProposalRewardsAddress,
  );

  const isRewardsDataDefined =
    proposalMatchedProposalRewards !== undefined && proposalRewardsThreshold !== undefined;

  const isThresholdUnknown = isEpoch1 || !isRewardsDataDefined;

  return (
    <div className={cx(styles.root, className, isEpoch1 && styles.isEpoch1)}>
      <div
        className={cx(
          styles.dot,
          isDonationAboveThreshold && styles.isDonationAboveThreshold,
          isThresholdUnknown && styles.isThresholdUnknown,
        )}
      />
      {isEpoch1 && t('epoch1')}
      {!isEpoch1 && !isRewardsDataDefined && i18n.t('common.allocationValuesNotAvailable')}
      {!isEpoch1 && isRewardsDataDefined && (
        <Trans
          i18nKey="views.allocation.allocationItem.standard"
          values={{
            sum: getFormattedEthValue(proposalMatchedProposalRewards?.sum).value,
            threshold: getFormattedEthValue(proposalRewardsThreshold).fullString,
          }}
        />
      )}
    </div>
  );
};

export default AllocationItemProposalRewards;
