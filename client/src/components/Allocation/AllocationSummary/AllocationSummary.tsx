import cx from 'classnames';
import React, { FC, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import ProjectAllocationDetailRow from 'components/shared/ProjectAllocationDetailRow';
import BoxRounded from 'components/ui/BoxRounded';
import Sections from 'components/ui/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/ui/BoxRounded/Sections/types';
import Header from 'components/ui/Header';
import useAllocateLeverage from 'hooks/mutations/useAllocateLeverage';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useAllocationsStore from 'store/allocations/store';

import styles from './AllocationSummary.module.scss';
import AllocationSummaryProps from './types';

const AllocationSummary: FC<AllocationSummaryProps> = ({ allocationValues }) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.allocationSummary',
  });
  const { data: individualReward, isFetching: isFetchingIndividualReward } = useIndividualReward();
  const { rewardsForProposals } = useAllocationsStore(state => ({
    rewardsForProposals: state.data.rewardsForProposals,
  }));

  const allocationValuesPositive = allocationValues.filter(({ value }) => !value.isZero());
  const areAllocationValuesPositive = allocationValuesPositive?.length > 0;

  const sections: SectionProps[] = [];
  const personalAllocation = individualReward?.sub(rewardsForProposals);

  const {
    data: allocateLeverage,
    mutateAsync,
    isLoading: isLoadingAllocateLeverage,
  } = useAllocateLeverage();

  useEffect(() => {
    if (areAllocationValuesPositive) {
      mutateAsync(allocationValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!personalAllocation?.isZero()) {
    sections.push({
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        isFetching: isFetchingIndividualReward,
        shouldIgnoreGwei: true,
        valueCrypto: individualReward?.sub(rewardsForProposals),
      },
      label: i18n.t('common.personal'),
    });
  }

  if (areAllocationValuesPositive) {
    sections.push(
      {
        doubleValueProps: {
          cryptoCurrency: 'ethereum',
          shouldIgnoreGwei: true,
          valueCrypto: rewardsForProposals,
        },
        label: t('allocationProjects', { projectsNumber: allocationValuesPositive.length }),
      },
      {
        childrenRight: isLoadingAllocateLeverage ? (
          <div className={styles.loader} />
        ) : (
          <div className={styles.text}>
            {allocateLeverage ? parseInt(allocateLeverage.leverage, 10) : 0}x
          </div>
        ),
        label: t('estimatedLeverage'),
        tooltipProps: {
          position: 'bottom-right',
          text: (
            <div>
              <Trans
                components={[<span className={styles.bold} />]}
                i18nKey="components.dedicated.allocationSummary.tooltip"
              />
            </div>
          ),
        },
      },
    );
  }

  return (
    <BoxRounded
      className={cx(styles.root, areAllocationValuesPositive && styles.areAllocationValuesPositive)}
      hasPadding={false}
      isVertical
    >
      <Header className={styles.header} text={t('confirmYourAllocations')} />
      <Sections sections={sections} variant="small" />
      {areAllocationValuesPositive && (
        <div className={styles.projects}>
          {allocationValuesPositive?.map(({ address, value }) => (
            <ProjectAllocationDetailRow key={address} address={address} amount={value} />
          ))}
        </div>
      )}
    </BoxRounded>
  );
};

export default AllocationSummary;
