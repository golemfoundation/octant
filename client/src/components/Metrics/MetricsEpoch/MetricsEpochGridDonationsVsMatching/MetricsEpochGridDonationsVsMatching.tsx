import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsDonationsProgressBar from 'components/Metrics/MetricsDonationsProgressBar';
import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';

import MetricsEpochGridDonationsVsMatchingProps from './types';

const MetricsEpochGridDonationsVsMatching: FC<MetricsEpochGridDonationsVsMatchingProps> = ({
  totalUserDonationsWithPatronRewards,
  isLoading,
  matchingFund,
  className,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });

  const totalUserDonationWithPatronRewardsNumber = parseFloat(
    formatUnitsBigInt(totalUserDonationsWithPatronRewards),
  );
  const matchingFundNumber = parseFloat(formatUnitsBigInt(matchingFund));

  const donationsValue =
    totalUserDonationWithPatronRewardsNumber > 0
      ? (totalUserDonationWithPatronRewardsNumber /
          (matchingFundNumber + totalUserDonationWithPatronRewardsNumber)) *
        100
      : 0;

  return (
    <MetricsGridTile
      className={className}
      dataTest="MetricsEpochGridDonationsVsMatching"
      groups={[
        {
          children: (
            <MetricsDonationsProgressBar
              compareValueLabel={t('matching')}
              donationsValue={donationsValue}
              isLoading={isLoading}
            />
          ),
          title: t('donationsVsMatchFunding'),
        },
      ]}
    />
  );
};

export default MetricsEpochGridDonationsVsMatching;
