import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import AllocationSummaryProject from 'components/Allocation/AllocationSummaryProject';
import BoxRounded from 'components/ui/BoxRounded';
import Sections from 'components/ui/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/ui/BoxRounded/Sections/types';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useEpochLeverage from 'hooks/queries/useEpochLeverage';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useAllocationsStore from 'store/allocations/store';
import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';

import styles from './AllocationSummary.module.scss';
import AllocationSummaryProps from './types';

const AllocationSummary: FC<AllocationSummaryProps> = ({
  allocationSimulated,
  isLoadingAllocateSimulate,
}) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.allocationSummary',
  });
  const { data: individualReward } = useIndividualReward();
  const { data: userAllocations } = useUserAllocations();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: epochLeverage } = useEpochLeverage(currentEpoch! - 1);
  const { rewardsForProjects } = useAllocationsStore(state => ({
    rewardsForProjects: state.data.rewardsForProjects,
  }));

  const getValuesToDisplay = useGetValuesToDisplay();

  // const allocationSimulatedMatchingFundSum = allocationSimulated?.matched.reduce((acc, curr) => {
  //   return acc+(parseUnitsBigInt(curr.value, 'wei'));
  // }, BigInt(0));

  const userAllocationsPositive =
    userAllocations?.elements.filter(({ value }) => value !== 0n) || [];
  const areUserAllocationsPositive = userAllocationsPositive?.length > 0;

  const personalAllocation = individualReward ? individualReward - rewardsForProjects : 0n;

  const rewardsForProjectsToDisplay = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    getFormattedEthValueProps: {
      shouldIgnoreGwei: true,
    },
    valueCrypto: rewardsForProjects,
  });

  const leverage = isDecisionWindowOpen ? allocationSimulated?.leverage : epochLeverage?.toString();

  const matchingFundSumToDisplay =
    rewardsForProjects && leverage
      ? getValuesToDisplay({
          cryptoCurrency: 'ethereum',
          valueCrypto: rewardsForProjects * BigInt(parseInt(leverage, 10)),
        }).primary
      : undefined;
  const totalImpactToDisplay = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    showCryptoSuffix: true,
    valueCrypto:
      rewardsForProjects && leverage
        ? rewardsForProjects * BigInt(parseInt(leverage, 10) + 1)
        : rewardsForProjects,
  }).primary;
  const personalToDisplay = individualReward
    ? getValuesToDisplay({
        cryptoCurrency: 'ethereum',
        showCryptoSuffix: true,
        valueCrypto: individualReward - rewardsForProjects,
      }).primary
    : undefined;

  const sections: SectionProps[] = [
    {
      childrenLeft: (
        <div className={styles.leftSection}>
          <div className={styles.label}>{i18n.t('common.totalDonated')}</div>
          <div className={styles.label}>
            {i18n.t('common.matchFunding')}
            <span
              className={cx(
                styles.matchFundingLeverage,
                isLoadingAllocateSimulate && styles.isLoading,
              )}
            >
              {leverage ? `${parseInt(leverage, 10)}x` : undefined}
            </span>
          </div>
        </div>
      ),
      childrenRight: (
        <div className={styles.rightSection}>
          <div className={styles.value}>{rewardsForProjectsToDisplay.primary}</div>
          <div className={cx(styles.value, !matchingFundSumToDisplay && styles.isLoading)}>
            {matchingFundSumToDisplay}
          </div>
        </div>
      ),
      className: styles.section,
    },
    {
      childrenLeft: <div className={styles.label}>{t('totalImpact')}</div>,
      childrenRight: <div className={styles.value}>{totalImpactToDisplay}</div>,

      className: styles.section,
    },
  ];

  return (
    <>
      {areUserAllocationsPositive && (
        <BoxRounded
          className={styles.root}
          dataTest="AllocationSummary"
          hasPadding={false}
          isVertical
        >
          <div className={styles.projects}>
            {userAllocationsPositive?.map(({ address, value }) => (
              <AllocationSummaryProject
                key={address}
                address={address}
                amount={value}
                isLoadingAllocateSimulate={isLoadingAllocateSimulate}
                simulatedMatched={
                  allocationSimulated?.matched.find(element => element.address === address)?.value
                }
                value={formatUnitsBigInt(value)}
              />
            ))}
          </div>
          <Sections sections={sections} variant="small" />
        </BoxRounded>
      )}
      {personalAllocation !== 0n && (
        <BoxRounded
          className={cx(
            styles.personalRewardBox,
            areUserAllocationsPositive && styles.areAllocationValuesPositive,
          )}
          dataTest="AllocationSummary__personalRewardBox"
        >
          <div className={styles.personalReward}>
            <div className={styles.label}>{i18n.t('common.personal')}</div>
            <div
              className={cx(styles.value, !personalToDisplay && styles.isLoading)}
              data-test="AllocationSummary__personalReward"
            >
              {personalToDisplay}
            </div>
          </div>
        </BoxRounded>
      )}
    </>
  );
};

export default AllocationSummary;
