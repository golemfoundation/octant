import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import AllocationSummaryProject from 'components/Allocation/AllocationSummaryProject';
import BoxRounded from 'components/ui/BoxRounded';
import Sections from 'components/ui/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/ui/BoxRounded/Sections/types';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useAllocationsStore from 'store/allocations/store';
import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';
import getFormattedEthValue from 'utils/getFormattedEthValue';

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
  const { rewardsForProjects } = useAllocationsStore(state => ({
    rewardsForProjects: state.data.rewardsForProjects,
  }));

  // const allocationSimulatedMatchingFundSum = allocationSimulated?.matched.reduce((acc, curr) => {
  //   return acc+(parseUnitsBigInt(curr.value, 'wei'));
  // }, BigInt(0));

  const userAllocationsPositive =
    userAllocations?.elements.filter(({ value }) => value !== 0n) || [];
  const areUserAllocationsPositive = userAllocationsPositive?.length > 0;

  const personalAllocation = individualReward ? individualReward - rewardsForProjects : 0n;

  const rewardsForProjectsToDisplay = getFormattedEthValue(rewardsForProjects, true, true);
  const matchingFundSumToDisplay =
    rewardsForProjects && allocationSimulated?.leverage
      ? getFormattedEthValue(
          rewardsForProjects * BigInt(parseInt(allocationSimulated.leverage, 10)),
        ).value
      : undefined;
  const totalImpactToDisplay = getFormattedEthValue(
    rewardsForProjects && allocationSimulated
      ? rewardsForProjects * BigInt(parseInt(allocationSimulated.leverage, 10) + 1)
      : rewardsForProjects,
  );
  const personalToDisplay = individualReward
    ? getFormattedEthValue(individualReward - rewardsForProjects).fullString
    : undefined;

  const sections: SectionProps[] = [
    {
      childrenLeft: (
        <div className={styles.leftSection}>
          <div className={styles.label}>{i18n.t('common.totalDonated')}</div>
          <div className={styles.label}>
            {t('matchFunding')}
            <span
              className={cx(
                styles.matchFundingLeverage,
                isLoadingAllocateSimulate && styles.isLoading,
              )}
            >
              {allocationSimulated ? `${parseInt(allocationSimulated.leverage, 10)}x` : undefined}
            </span>
          </div>
        </div>
      ),
      childrenRight: (
        <div className={styles.rightSection}>
          <div className={styles.value}>{rewardsForProjectsToDisplay.value}</div>
          <div className={cx(styles.value, !matchingFundSumToDisplay && styles.isLoading)}>
            {matchingFundSumToDisplay}
          </div>
        </div>
      ),
      className: styles.section,
    },
    {
      childrenLeft: <div className={styles.label}>{t('totalImpact')}</div>,
      childrenRight: <div className={styles.value}>{totalImpactToDisplay.fullString}</div>,

      className: styles.section,
    },
  ];

  return (
    <>
      {areUserAllocationsPositive && (
        <BoxRounded className={styles.root} hasPadding={false} isVertical>
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
        >
          <div className={styles.personalReward}>
            <div className={styles.label}>{i18n.t('common.personal')}</div>
            <div className={cx(styles.value, !personalToDisplay && styles.isLoading)}>
              {personalToDisplay}
            </div>
          </div>
        </BoxRounded>
      )}
    </>
  );
};

export default AllocationSummary;
