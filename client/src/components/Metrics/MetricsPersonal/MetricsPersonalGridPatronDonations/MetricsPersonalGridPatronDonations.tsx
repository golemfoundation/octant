import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';

import MetricsPersonalGridPatronDonationsProps from './types';

const MetricsPersonalGridPatronDonations: FC<MetricsPersonalGridPatronDonationsProps> = ({
  isLoading,
  numberOfEpochs,
  value,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });

  const getValuesToDisplay = useGetValuesToDisplay();

  const totalPatronDonationsValues = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    valueCrypto: value,
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
                numberOfEpochs,
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

export default memo(MetricsPersonalGridPatronDonations);
