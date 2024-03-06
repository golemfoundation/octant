import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsDonationsProgressBar from 'components/Metrics/MetricsDonationsProgressBar';
import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';

import MetricsEpochGridDonationsVsPersonalAllocationsProps from './types';

const MetricsEpochGridDonationsVsPersonalAllocations: FC<
  MetricsEpochGridDonationsVsPersonalAllocationsProps
> = ({ totalDonations, isLoading, totalPersonal, className }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });

  const totalDonationsNumber = parseFloat(formatUnitsBigInt(totalDonations));
  const totalPersonalNumber = parseFloat(formatUnitsBigInt(totalPersonal));

  const donationsValue =
    totalDonationsNumber > 0
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
