import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsDonationsProgressBar from 'components/Metrics/MetricsDonationsProgressBar';
import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import useMetricsPersonalDataRewardsUsage from 'hooks/helpers/useMetricsPersonalDataRewardsUsage';

import MetricsPersonalGridDonationsProgressBarProps from './types';

const MetricsPersonalGridDonationsProgressBar: FC<MetricsPersonalGridDonationsProgressBarProps> = ({
  isLoading,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { data: metricsPersonalDataRewardsUsage } = useMetricsPersonalDataRewardsUsage();

  const totalDonationsNumber = parseFloat(
    formatUnits(metricsPersonalDataRewardsUsage?.totalDonations || BigNumber.from(0)),
  );
  const totalRewardsUsedNumber = parseFloat(
    formatUnits(metricsPersonalDataRewardsUsage?.totalRewardsUsed || BigNumber.from(0)),
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
                !!metricsPersonalDataRewardsUsage?.totalDonations.isZero() &&
                !!metricsPersonalDataRewardsUsage?.totalWithdrawals.isZero()
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
