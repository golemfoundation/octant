import { formatUnits } from 'ethers/lib/utils';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsDonationsProgressBar from 'components/Metrics/MetricsDonationsProgressBar';
import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';

import MetricsEpochGridDonationsVsPersonalAllocationsProps from './types';

const MetricsEpochGridDonationsVsPersonalAllocations: FC<
  MetricsEpochGridDonationsVsPersonalAllocationsProps
> = ({ totalDonations, isLoading, totalPersonal, className }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });

  const totalDonationsNumber = parseFloat(formatUnits(totalDonations));
  const totalPersonalNumber = parseFloat(formatUnits(totalPersonal));

  const donationsValue =
    totalPersonalNumber && totalDonationsNumber
      ? (totalDonationsNumber / (totalPersonalNumber + totalDonationsNumber)) * 100
      : 0;

  return (
    <MetricsGridTile
      className={className}
      dataTest="MetricsEpochGridDonationsVsPersonalAllocations"
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

export default MetricsEpochGridDonationsVsPersonalAllocations;
