import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsDonationsProgressBar from 'components/Metrics/MetricsDonationsProgressBar';
import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useUserAllocations from 'hooks/queries/useUserAllocations';

import MetricsPersonalGridDonationsProgressBarProps from './types';

const MetricsPersonalGridDonationsProgressBar: FC<MetricsPersonalGridDonationsProgressBarProps> = ({
  isLoading,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { data: userAllocations } = useUserAllocations();
  const { data: individualReward } = useIndividualReward();

  const userAllocationsSum =
    userAllocations?.elements.reduce((acc, curr) => acc.add(curr.value), BigNumber.from(0)) ||
    BigNumber.from(0);

  const userAllocationsSumNumber = parseFloat(formatUnits(userAllocationsSum));
  const individualRewardNumber = parseFloat(formatUnits(individualReward || BigNumber.from(0)));

  const donationsValue =
    individualRewardNumber > 0 ? (userAllocationsSumNumber / individualRewardNumber) * 100 : 0;

  return (
    <MetricsGridTile
      groups={[
        {
          children: (
            <MetricsDonationsProgressBar donationsValue={donationsValue} isLoading={isLoading} />
          ),
          title: t('donationsVsPersonalAllocationValue'),
        },
      ]}
    />
  );
};

export default MetricsPersonalGridDonationsProgressBar;
