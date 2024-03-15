import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import { getValuesToDisplay } from 'components/ui/DoubleValue/utils';
import useMetricsEpoch from 'hooks/helpers/useMetrcisEpoch';
import useProjectsDonors from 'hooks/queries/donors/useProjectsDonors';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useMatchedProjectRewards from 'hooks/queries/useMatchedProjectRewards';
import useProjectRewardsThreshold from 'hooks/queries/useProjectRewardsThreshold';
import i18n from 'i18n';
import useSettingsStore from 'store/settings/store';

import MetricsEpochGridBelowThresholdProps from './types';

const MetricsEpochGridBelowThreshold: FC<MetricsEpochGridBelowThresholdProps> = ({
  isLoading,
  className,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const {
    data: { displayCurrency },
  } = useSettingsStore(({ data }) => ({
    data: {
      displayCurrency: data.displayCurrency,
      isCryptoMainValueDisplay: data.isCryptoMainValueDisplay,
    },
  }));
  const { epoch, lastEpoch } = useMetricsEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: cryptoValues, error } = useCryptoValues(displayCurrency);
  const { data: matchedProjectRewards } = useMatchedProjectRewards(
    isDecisionWindowOpen && epoch === lastEpoch ? undefined : epoch,
  );
  const { data: projectsDonors } = useProjectsDonors(
    isDecisionWindowOpen && epoch === lastEpoch ? undefined : epoch,
  );

  const { data: projectRewardsThreshold } = useProjectRewardsThreshold(
    isDecisionWindowOpen && epoch === lastEpoch ? undefined : epoch,
  );

  const projectsBelowThreshold =
    Object.keys(projectsDonors).length -
    (matchedProjectRewards?.filter(({ matched }) => matched !== 0n).length || 0);

  const ethBelowThreshold =
    projectRewardsThreshold === undefined
      ? BigInt(0)
      : Object.values(projectsDonors).reduce((acc, curr) => {
          const projectSumOfDonations = curr.reduce((acc2, curr2) => {
            return acc2 + curr2.amount;
          }, BigInt(0));

          if (projectSumOfDonations < projectRewardsThreshold) {
            return acc + projectSumOfDonations;
          }

          return acc;
        }, BigInt(0));

  const ethBelowThresholdToDisplay = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    cryptoValues,
    displayCurrency: displayCurrency!,
    error,
    isCryptoMainValueDisplay: true,
    shouldIgnoreGwei: false,
    valueCrypto: ethBelowThreshold,
  });

  return (
    <MetricsGridTile
      className={className}
      dataTest="MetricsEpochGridBelowThreshold"
      groups={[
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              size="S"
              subvalue={i18n.t('common.projects').toUpperCase()}
              value={projectsBelowThreshold.toString()}
            />
          ),
          title: t('belowThreshold'),
        },
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              size="S"
              subvalue={ethBelowThresholdToDisplay.secondary}
              value={ethBelowThresholdToDisplay.primary}
            />
          ),
          title: t('ethBelowThreshold'),
        },
      ]}
      size="M"
    />
  );
};

export default MetricsEpochGridBelowThreshold;
