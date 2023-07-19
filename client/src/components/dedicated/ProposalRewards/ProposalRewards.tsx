import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import ProgressBar from 'components/core/ProgressBar/ProgressBar';
import useProposalRewardsThresholdFraction from 'hooks/queries/useProposalRewardsThresholdFraction';
import useUsersAllocationsSum from 'hooks/queries/useUsersAllocationsSum';
import getCutOffValueBigNumber from 'utils/getCutOffValueBigNumber';
import getValueCryptoToDisplay from 'utils/getValueCryptoToDisplay';

import styles from './ProposalRewards.module.scss';
import ProposalRewardsProps from './types';
import { getProgressPercentage } from './utils';

const ProposalRewards: FC<ProposalRewardsProps> = ({
  canFoundedAtHide = true,
  className,
  MiddleElement,
  totalValueOfAllocations,
}) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.proposalRewards',
  });

  const { data: proposalRewardsThresholdFraction } = useProposalRewardsThresholdFraction();
  const { data: usersAllocationsSum } = useUsersAllocationsSum();

  const cutOffValue = getCutOffValueBigNumber(
    usersAllocationsSum,
    proposalRewardsThresholdFraction,
  );
  const isProjectFounded = totalValueOfAllocations
    ? totalValueOfAllocations.gte(cutOffValue)
    : false;

  const isFundedAtHidden =
    cutOffValue.isZero() ||
    (canFoundedAtHide && !cutOffValue.isZero() && totalValueOfAllocations && isProjectFounded);

  const isTotalValueOfAllocationsDefined = totalValueOfAllocations !== undefined;

  const totalValueOfAllocationsToDisplay = getValueCryptoToDisplay({
    cryptoCurrency: 'ethereum',
    valueCrypto: totalValueOfAllocations,
  });

  const cutOffValueToDisplay = getValueCryptoToDisplay({
    cryptoCurrency: 'ethereum',
    valueCrypto: cutOffValue,
  });

  return (
    <div className={cx(styles.root, className)} data-test="ProposalRewards">
      <div className={styles.separator}>
        {isProjectFounded || !isTotalValueOfAllocationsDefined ? (
          <div className={styles.line} />
        ) : (
          <ProgressBar
            progressPercentage={getProgressPercentage(totalValueOfAllocations, cutOffValue)}
            variant="orange"
          />
        )}
      </div>
      <div className={styles.values}>
        {isTotalValueOfAllocationsDefined ? (
          <div className={styles.value}>
            <span className={styles.label} data-test="ProposalRewards__totalDonated__label">
              {t('totalDonated')}
            </span>
            <span
              className={cx(styles.number, !isProjectFounded && styles.isBelowCutOff)}
              data-test="ProposalRewards__totalDonated__number"
            >
              {totalValueOfAllocationsToDisplay}
            </span>
          </div>
        ) : (
          <div className={styles.allocationValuesNotAvailable}>
            {i18n.t('common.allocationValuesNotAvailable')}
          </div>
        )}
        {MiddleElement}
        {isTotalValueOfAllocationsDefined && (
          <div className={cx(styles.value, isFundedAtHidden && styles.isHidden)}>
            <span className={styles.label}>{t('fundedAt')}</span>
            <span className={styles.number}>{cutOffValueToDisplay}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalRewards;
