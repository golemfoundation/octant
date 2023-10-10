import { BigNumber } from 'ethers';
import React, { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Sections from 'components/core/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/core/BoxRounded/Sections/types';
import Header from 'components/core/Header/Header';
import ProjectAllocationDetailRow from 'components/dedicated/ProjectAllocationDetailRow/ProjectAllocationDetailRow';
import useAllocateSimulate from 'hooks/mutations/useAllocateSimulate';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useUserAllocationNonce from 'hooks/queries/useUserAllocationNonce';
import useAllocationsStore from 'store/allocations/store';

import styles from './AllocationSummary.module.scss';
import AllocationSummaryProps from './types';

const AllocationSummary: FC<AllocationSummaryProps> = ({ allocationValues }) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.allocationSummary',
  });
  const { data: individualReward, isFetching: isFetchingIndividualReward } = useIndividualReward();
  const { data: userNonce, isLoading: isLoadingUserNonce } = useUserAllocationNonce();
  const { rewardsForProposals } = useAllocationsStore(state => ({
    rewardsForProposals: state.data.rewardsForProposals,
  }));

  const allocationValuesPositive = allocationValues.filter(({ value }) => !value.isZero());

  const sections: SectionProps[] = [];
  const personalAllocation = individualReward?.sub(rewardsForProposals);

  const {
    data: allocateSimulate,
    mutateAsync,
    isLoading: isLoadingAllocateSimulate,
  } = useAllocateSimulate(userNonce!);

  useEffect(() => {
    if (!userNonce) {
      return;
    }
    mutateAsync(allocationValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userNonce]);

  if (!personalAllocation?.isZero()) {
    sections.push({
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        isFetching: isFetchingIndividualReward,
        valueCrypto: individualReward?.sub(rewardsForProposals),
      },
      label: i18n.t('common.personal'),
    });
  }

  if (allocationValuesPositive.length > 0) {
    sections.push(
      {
        doubleValueProps: {
          cryptoCurrency: 'ethereum',
          valueCrypto: rewardsForProposals,
        },
        label: t('allocationProjects', { projectsNumber: allocationValuesPositive.length }),
      },
      {
        doubleValueProps: {
          cryptoCurrency: 'ethereum',
          isFetching: isLoadingAllocateSimulate || isLoadingUserNonce,
          valueCrypto: allocateSimulate?.rewards.reduce(
            (acc, curr) => acc.add(curr.matched),
            BigNumber.from(0),
          ),
        },
        label: t('matchFundingEstimate'),
      },
    );
  }

  return (
    <BoxRounded className={styles.root} hasPadding={false} isVertical>
      <Header className={styles.header} text={t('confirmYourAllocations')} />
      <Sections sections={sections} variant="small" />
      <div className={styles.projects}>
        {allocationValuesPositive?.map(({ address, value }) => (
          <ProjectAllocationDetailRow key={address} address={address} amount={value} />
        ))}
      </div>
    </BoxRounded>
  );
};

export default AllocationSummary;
