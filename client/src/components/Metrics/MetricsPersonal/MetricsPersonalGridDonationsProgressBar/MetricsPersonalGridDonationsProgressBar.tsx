import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsDonationsProgressBar from 'components/Metrics/MetricsDonationsProgressBar';
import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import useMetricsPersonalDataRewardsUsage from 'hooks/helpers/useMetricsPersonalDataRewardsUsage';
import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';

import MetricsPersonalGridDonationsProgressBarProps from './types';

const MetricsPersonalGridDonationsProgressBar: FC<MetricsPersonalGridDonationsProgressBarProps> = ({
  isLoading,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { data: metricsPersonalDataRewardsUsage } = useMetricsPersonalDataRewardsUsage();

  const totalDonationsNumber = parseFloat(
    formatUnitsBigInt(metricsPersonalDataRewardsUsage?.totalDonations || BigInt(0)),
  );
  const totalRewardsUsedNumber = parseFloat(
    formatUnitsBigInt(metricsPersonalDataRewardsUsage?.totalRewardsUsed || BigInt(0)),
  );

  const donationsValue =
    totalRewardsUsedNumber > 0 ? (totalDonationsNumber / totalRewardsUsedNumber) * 100 : 0;

  return (
    <MetricsGridTile
      groups={[
        {
          children: (
            <MetricsDonationsProgressBar
              donationsValue={donationsValue}
              isDisabled={
                !!(metricsPersonalDataRewardsUsage?.totalDonations === 0n) &&
                !!(metricsPersonalDataRewardsUsage?.totalWithdrawals === 0n)
              }
              isLoading={isLoading}
            />
          ),
          title: t('donationsVsPersonalAllocationValue'),
        },
      ]}
    />
  );
};

export default MetricsPersonalGridDonationsProgressBar;
