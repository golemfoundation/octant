import { formatUnits } from 'ethers/lib/utils';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import { ETH_STAKED } from 'constants/stake';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useSettingsStore from 'store/settings/store';
import getValueFiatToDisplay from 'utils/getValueFiatToDisplay';

import MetricsGridTotalEthStakedProps from './types';

const MetricsGridTotalEthStaked: FC<MetricsGridTotalEthStakedProps> = ({ isLoading = false }) => {
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

  const ethStakedInt = parseInt(formatUnits(ETH_STAKED), 10);
  const ethStakedValue = ethStakedInt / 1000 >= 1 ? `${ethStakedInt / 1000}K` : `${ethStakedInt}`;

  const ethStakedFiatValue = getValueFiatToDisplay({
    cryptoCurrency: 'ethereum',
    cryptoValues,
    displayCurrency,
    error,
    isUsingHairSpace: false,
    valueCrypto: ETH_STAKED,
  });

  return (
    <MetricsGridTile
      dataTest="MetricsTotalEthStaked"
      groups={[
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              subvalue={ethStakedFiatValue}
              value={ethStakedValue}
            />
          ),
          title: t('totalEthStaked'),
        },
      ]}
      size="S"
    />
  );
};

export default MetricsGridTotalEthStaked;
