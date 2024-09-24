import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsDonationsProgressBar from 'components/Metrics/MetricsDonationsProgressBar';
import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';

import MetricsEpochGridDonationsVsPersonalAllocationsProps from './types';

const MetricsEpochGridDonationsVsPersonalAllocations: FC<
  MetricsEpochGridDonationsVsPersonalAllocationsProps
> = ({ totalUserDonations, isLoading, totalPersonal, className }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });

  const totalUserDonationsNumber = parseFloat(formatUnitsBigInt(totalUserDonations));
  const totalPersonalNumber = parseFloat(formatUnitsBigInt(totalPersonal));

  const donationsValue =
    totalUserDonationsNumber > 0
      ? (totalUserDonationsNumber / (totalPersonalNumber + totalUserDonationsNumber)) * 100
      : 0;

  return (
    <MetricsGridTile
      className={className}
      dataTest="MetricsEpochGridDonationsVsPersonalAllocations"
      groups={[
        {
          children: (
            <MetricsDonationsProgressBar
              compareValueLabel={t('personal')}
              donationsValue={donationsValue}
              isLoading={isLoading}
            />
          ),
          title: t('donationsVsPersonal'),
        },
      ]}
    />
  );
};

export default MetricsEpochGridDonationsVsPersonalAllocations;
