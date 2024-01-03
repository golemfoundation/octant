import cx from 'classnames';
import { parseUnits } from 'ethers/lib/utils';
import React, { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import AllocationSummaryProject from 'components/Allocation/AllocationSummaryProject';
import BoxRounded from 'components/ui/BoxRounded';
import Sections from 'components/ui/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/ui/BoxRounded/Sections/types';
import useAllocateLeverage from 'hooks/mutations/useAllocateLeverage';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useAllocationsStore from 'store/allocations/store';
import getFormattedEthValue from 'utils/getFormattedEthValue';

import styles from './AllocationSummary.module.scss';
import AllocationSummaryProps from './types';

const AllocationSummary: FC<AllocationSummaryProps> = ({ allocationValues }) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.allocationSummary',
  });
  const { data: individualReward } = useIndividualReward();
  const { rewardsForProposals } = useAllocationsStore(state => ({
    rewardsForProposals: state.data.rewardsForProposals,
  }));
  const { data: allocateLeverage, mutateAsync } = useAllocateLeverage();

  const allocationValuesPositive = allocationValues.filter(
    ({ value }) => !parseUnits(value).isZero(),
  );
  const areAllocationValuesPositive = allocationValuesPositive?.length > 0;

  const personalAllocation = individualReward?.sub(rewardsForProposals);

  const rewardsForProposalsToDisplay = getFormattedEthValue(rewardsForProposals, true, true);

  const sections: SectionProps[] = [
    {
      childrenLeft: (
        <div className={styles.leftSection}>
          <div className={styles.label}>{i18n.t('common.totalDonated')}</div>
          <div className={styles.label}>
            {t('matchFunding')}
            <span className={styles.matchFundingLeverage}>
              {allocateLeverage ? parseInt(allocateLeverage.leverage, 10) : 0}x
            </span>
          </div>
        </div>
      ),
      childrenRight: (
        <div className={styles.rightSection}>
          <div className={styles.value}>{rewardsForProposalsToDisplay.value}</div>
          {/* TODO: Display real value */}
          <div className={styles.value}>10.7635</div>
        </div>
      ),
      className: styles.section,
    },
    {
      childrenLeft: <div className={styles.label}>{t('totalImpact')}</div>,
      // TODO: Display real value
      childrenRight: <div className={styles.value}>10.8885 ETH</div>,

      className: styles.section,
    },
  ];

  useEffect(() => {
    if (areAllocationValuesPositive) {
      mutateAsync(allocationValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <BoxRounded
        className={cx(
          styles.root,
          areAllocationValuesPositive && styles.areAllocationValuesPositive,
        )}
        hasPadding={false}
        isVertical
      >
        {areAllocationValuesPositive && (
          <div className={styles.projects}>
            {allocationValuesPositive?.map(({ address, value }) => (
              <AllocationSummaryProject
                key={address}
                address={address}
                amount={parseUnits(value)}
              />
            ))}
          </div>
        )}
        <Sections sections={sections} variant="small" />
      </BoxRounded>
      {personalAllocation?.isZero() !== true && (
        <BoxRounded className={styles.personalRewardBox}>
          <div className={styles.personalReward}>
            <div className={styles.label}>{i18n.t('common.personal')}</div>
            {/* TODO: Display real value */}
            <div className={styles.value}>0.3125 ETH</div>
          </div>
        </BoxRounded>
      )}
    </>
  );
};

export default AllocationSummary;
