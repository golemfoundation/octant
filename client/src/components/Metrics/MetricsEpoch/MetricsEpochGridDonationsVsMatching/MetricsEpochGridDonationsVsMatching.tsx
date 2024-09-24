import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsDonationsProgressBar from 'components/Metrics/MetricsDonationsProgressBar';
import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';

import MetricsEpochGridDonationsVsMatchingProps from './types';

const MetricsEpochGridDonationsVsMatching: FC<MetricsEpochGridDonationsVsMatchingProps> = ({
  totalUserDonations,
  isLoading,
  matchingFund,
  className,
}) => {
  const { i18n, t } = useTranslation('translation', { keyPrefix: 'views.metrics' });

  const totalUserDonationsNumber = parseFloat(formatUnitsBigInt(totalUserDonations));
  const matchingFundNumber = parseFloat(formatUnitsBigInt(matchingFund));

  const donationsValue =
    totalUserDonationsNumber > 0
      ? (totalUserDonationsNumber / (matchingFundNumber + totalUserDonationsNumber)) * 100
      : 0;

  return (
    <MetricsGridTile
      className={className}
      dataTest="MetricsEpochGridDonationsVsMatching"
      groups={[
        {
          children: (
            <MetricsDonationsProgressBar
              compareValueLabel={i18n.t('common.matching')}
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
