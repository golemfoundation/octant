import cx from 'classnames';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useUpcomingBudget from 'hooks/queries/useUpcomingBudget';

import styles from './AllocationRewardsBox.module.scss';
import AllocationRewardsBoxProps from './types';

const AllocationRewardsBox: FC<AllocationRewardsBoxProps> = ({
  isDisabled,
  isLocked,
  isManuallyEdited,
}) => {
  const dataTestRoot = 'AllocationRewardsBox';
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.allocationRewardsBox',
  });
  const { data: individualReward, isFetching: isFetchingIndividualReward } = useIndividualReward();
  const { data: upcomingBudget, isFetching: isFetchingUpcomingBudget } = useUpcomingBudget();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const getValuesToDisplay = useGetValuesToDisplay();

  const hasUserIndividualReward = !!individualReward && individualReward !== 0n;
  const isDecisionWindowOpenAndHasIndividualReward =
    hasUserIndividualReward && isDecisionWindowOpen;

  const isLoading = isFetchingIndividualReward || isFetchingUpcomingBudget;

  const subtitle = useMemo(() => {
    if (isDecisionWindowOpen === false && upcomingBudget) {
      return t('availableDuringAllocation');
    }
    if (isLocked) {
      return t('allocated');
    }
    if (isDecisionWindowOpenAndHasIndividualReward) {
      return i18n.t('common.availableNow');
    }
    return t('subtitleNoRewards');
  }, [
    isLocked,
    isDecisionWindowOpenAndHasIndividualReward,
    upcomingBudget,
    isDecisionWindowOpen,
    t,
    i18n,
  ]);

  const budget = useMemo(() => {
    if (isDecisionWindowOpen) {
      return individualReward;
    }
    if (isDecisionWindowOpen === false && upcomingBudget) {
      return upcomingBudget;
    }
    return BigInt(0);
  }, [isDecisionWindowOpen, individualReward, upcomingBudget]);

  return (
    <div
      className={cx(
        styles.root,
        isManuallyEdited && styles.isManuallyEdited,
        isLoading && styles.isLoading,
      )}
      data-test={dataTestRoot}
    >
      <div>
        <div
          className={cx(styles.value, (isDisabled || isLocked) && styles.isGrey)}
          data-test={`${dataTestRoot}__value${isLoading ? 'Loading' : ''}`}
        >
          {!isLoading &&
            getValuesToDisplay({
              cryptoCurrency: 'ethereum',
              showCryptoSuffix: true,
              showLessThanOneCentFiat: !isDisabled,
              valueCrypto: budget,
            }).primary}
        </div>
        <div
          className={styles.label}
          data-test={`${dataTestRoot}__subtitle${isLoading ? 'Loading' : ''}`}
        >
          {!isLoading && subtitle}
        </div>
      </div>
      {isManuallyEdited && <div className={styles.manuallyEditedLabel}>{t('manual')}</div>}
    </div>
  );
};

export default AllocationRewardsBox;
