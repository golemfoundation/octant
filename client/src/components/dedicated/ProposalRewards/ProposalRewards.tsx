import cx from 'classnames';
import React, { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import ProgressBar from 'components/core/ProgressBar/ProgressBar';
import useIndividualProposalRewards from 'hooks/queries/useIndividualProposalRewards';
import useProposalRewardsThresholdFraction from 'hooks/queries/useProposalRewardsThresholdFraction';
import getCutOffValueBigNumber from 'utils/getCutOffValueBigNumber';
import getFormattedEthValue from 'utils/getFormattedEthValue';

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

  const { data: individualProposalRewards } = useIndividualProposalRewards();
  const { data: proposalRewardsThresholdFraction } = useProposalRewardsThresholdFraction();

  const cutOffValue = getCutOffValueBigNumber(
    individualProposalRewards?.sum,
    proposalRewardsThresholdFraction,
  );
  const isProjectFounded = totalValueOfAllocations
    ? totalValueOfAllocations.gte(cutOffValue)
    : false;

  const isFundedAtHidden =
    cutOffValue.isZero() ||
    (canFoundedAtHide && !cutOffValue.isZero() && totalValueOfAllocations && isProjectFounded);

  const isTotalValueOfAllocationsDefined = totalValueOfAllocations !== undefined;

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
          <Fragment>
            <div className={styles.value}>
              <span className={styles.label} data-test="ProposalRewards__totalDonated__label">
                {t('totalDonated')}
              </span>
              <span
                className={cx(styles.number, !isProjectFounded && styles.isBelowCutOff)}
                data-test="ProposalRewards__totalDonated__number"
              >
                {getFormattedEthValue(totalValueOfAllocations).fullString}
              </span>
            </div>
            {MiddleElement}
            <div className={cx(styles.value, isFundedAtHidden && styles.isHidden)}>
              <span className={styles.label}>{t('fundedAt')}</span>
              <span className={styles.number}>{getFormattedEthValue(cutOffValue).fullString}</span>
            </div>
          </Fragment>
        ) : (
          <div className={styles.allocationValuesNotAvailable}>
            {i18n.t('common.allocationValuesNotAvailable')}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalRewards;
