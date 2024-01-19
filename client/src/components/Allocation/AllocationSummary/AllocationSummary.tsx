import cx from 'classnames';
import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import AllocationSummaryProject from 'components/Allocation/AllocationSummaryProject';
import BoxRounded from 'components/ui/BoxRounded';
import Sections from 'components/ui/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/ui/BoxRounded/Sections/types';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useAllocationsStore from 'store/allocations/store';
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
  const { rewardsForProposals } = useAllocationsStore(state => ({
    rewardsForProposals: state.data.rewardsForProposals,
  }));

  const allocationSimulatedMatchingFundSum = allocationSimulated?.matched.reduce((acc, curr) => {
    return acc.add(parseUnits(curr.value, 'wei'));
  }, BigNumber.from(0));

  const userAllocationsPositive =
    userAllocations?.elements.filter(({ value }) => !value.isZero()) || [];
  const areUserAllocationsPositive = userAllocationsPositive?.length > 0;

  const personalAllocation = individualReward?.sub(rewardsForProposals);

  const rewardsForProposalsToDisplay = getFormattedEthValue(rewardsForProposals, true, true);
  const allocationSimulatedMatchingFundSumToDisplay = allocationSimulatedMatchingFundSum
    ? getFormattedEthValue(allocationSimulatedMatchingFundSum).value
    : undefined;
  const totalImpactToDisplay = getFormattedEthValue(
    allocationSimulatedMatchingFundSum
      ? allocationSimulatedMatchingFundSum.add(rewardsForProposals)
      : rewardsForProposals,
  );
  const personalToDisplay = individualReward
    ? getFormattedEthValue(individualReward?.sub(rewardsForProposals)).fullString
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
          <div className={styles.value}>{rewardsForProposalsToDisplay.value}</div>
          <div
            className={cx(
              styles.value,
              !allocationSimulatedMatchingFundSumToDisplay && styles.isLoading,
            )}
          >
            {allocationSimulatedMatchingFundSumToDisplay}
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
                value={formatUnits(value)}
              />
            ))}
          </div>
          <Sections sections={sections} variant="small" />
        </BoxRounded>
      )}
      {personalAllocation?.isZero() !== true && (
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
