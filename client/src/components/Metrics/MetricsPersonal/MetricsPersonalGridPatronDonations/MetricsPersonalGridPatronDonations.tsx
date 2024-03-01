import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import { getValuesToDisplay } from 'components/ui/DoubleValue/utils';
import useTotalPatronDonations from 'hooks/helpers/useTotalPatronDonations';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useSettingsStore from 'store/settings/store';

import MetricsPersonalGridPatronDonationsProps from './types';

const MetricsPersonalGridPatronDonations: FC<MetricsPersonalGridPatronDonationsProps> = ({
  isLoading,
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
  const { data: cryptoValues, error } = useCryptoValues(displayCurrency);
  const { data: totalPatronDonations } = useTotalPatronDonations();

  const totalPatronDonationsValues = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    cryptoValues,
    displayCurrency: displayCurrency!,
    error,
    isCryptoMainValueDisplay: true,
    shouldIgnoreGwei: false,
    valueCrypto: totalPatronDonations?.value,
  });

  return (
    <MetricsGridTile
      groups={[
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              size="S"
              value={t('patronModeActiveLabel', {
                numberOfEpochs: totalPatronDonations
                  ? totalPatronDonations.numberOfEpochs.toString()
                  : '',
              }).toUpperCase()}
            />
          ),
          title: t('patronModeActive'),
        },
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              size="S"
              subvalue={totalPatronDonationsValues.secondary}
              value={totalPatronDonationsValues.primary}
            />
          ),
          title: t('donatedAsPatron'),
        },
      ]}
      size="M"
    />
  );
};

export default MetricsPersonalGridPatronDonations;
