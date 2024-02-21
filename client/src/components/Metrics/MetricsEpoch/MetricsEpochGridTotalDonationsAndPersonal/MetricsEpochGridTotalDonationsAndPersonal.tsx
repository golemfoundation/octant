import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import { getValuesToDisplay } from 'components/ui/DoubleValue/utils';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useSettingsStore from 'store/settings/store';

import MetricsEpochGridTotalDonationsAndPersonalProps from './types';

const MetricsEpochGridTotalDonationsAndPersonal: FC<
  MetricsEpochGridTotalDonationsAndPersonalProps
> = ({ isLoading, totalDonations, totalPersonal, className }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const {
    data: { displayCurrency },
  } = useSettingsStore(({ data }) => ({
    data: {
      displayCurrency: data.displayCurrency,
      isCryptoMainValueDisplay: data.isCryptoMainValueDisplay,
    },
  }));
  const { data: cryptoValues, error } = useCryptoValues(displayCurrency);

  const totalDonationsValues = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    cryptoValues,
    displayCurrency: displayCurrency!,
    error,
    isCryptoMainValueDisplay: true,
    shouldIgnoreGwei: false,
    valueCrypto: totalDonations,
  });

  const totalPersonalValues = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    cryptoValues,
    displayCurrency: displayCurrency!,
    error,
    isCryptoMainValueDisplay: true,
    shouldIgnoreGwei: false,
    valueCrypto: totalPersonal,
  });

  return (
    <MetricsGridTile
      className={className}
      dataTest="MetricsEpochGridTotalDonationsAndPersonal"
      groups={[
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              size="S"
              subvalue={totalDonationsValues.secondary}
              value={totalDonationsValues.primary}
            />
          ),
          title: t('totalDonations'),
        },
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              size="S"
              subvalue={totalPersonalValues.secondary}
              value={totalPersonalValues.primary}
            />
          ),
          title: t('totalPersonal'),
        },
      ]}
      size="M"
    />
  );
};

export default MetricsEpochGridTotalDonationsAndPersonal;
