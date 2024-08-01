import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import useMetricsEpoch from 'hooks/helpers/useMetrcisEpoch';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useMatchedProjectRewards from 'hooks/queries/useMatchedProjectRewards';
import useProjectsEpoch from 'hooks/queries/useProjectsEpoch';
import i18n from 'i18n';
import useSettingsStore from 'store/settings/store';
import getValueCryptoToDisplay from 'utils/getValueCryptoToDisplay';
import getValueFiatToDisplay from 'utils/getValueFiatToDisplay';

import MetricsEpochGridBelowThresholdProps from './types';

const MetricsEpochGridBelowThreshold: FC<MetricsEpochGridBelowThresholdProps> = ({
  isLoading,
  className,
  ethBelowThreshold,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { epoch, lastEpoch } = useMetricsEpoch();
  const { data: projectsEpoch } = useProjectsEpoch(epoch);
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: matchedProjectRewards } = useMatchedProjectRewards(
    isDecisionWindowOpen && epoch === lastEpoch ? undefined : epoch,
  );
  const {
    data: { displayCurrency },
  } = useSettingsStore(({ data }) => ({
    data: {
      displayCurrency: data.displayCurrency,
    },
  }));
  const { data: cryptoValues, error } = useCryptoValues(displayCurrency);

  const projectsBelowThreshold =
    (projectsEpoch?.projectsAddresses.length || 0) -
    (matchedProjectRewards?.filter(({ matched }) => matched !== 0n).length || 0);

  const ethBelowThresholdToDisplay = getValueCryptoToDisplay({
    cryptoCurrency: 'ethereum',
    valueCrypto: ethBelowThreshold,
  });

  const ethBelowThresholdFiatToDisplay = getValueFiatToDisplay({
    cryptoCurrency: 'ethereum',
    cryptoValues,
    displayCurrency,
    error,
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
              dataTest="MetricsEpochGridBelowThreshold__ethBelowThreshold"
              isLoading={isLoading}
              size="S"
              subvalue={ethBelowThresholdFiatToDisplay}
              value={ethBelowThresholdToDisplay.value}
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
