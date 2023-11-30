import { formatUnits } from 'ethers/lib/utils';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/common/MetricsGridTile/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/common/MetricsGridTileValue/MetricsGridTileValue';
import ProgressBar from 'components/ui/ProgressBar';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useLockedSummaryLatest from 'hooks/subgraph/useLockedSummaryLatest';
import useSettingsStore from 'store/settings/store';
import getFormattedValueWithSymbolSuffix from 'utils/getFormattedValueWithSymbolSuffix';
import getValueFiatToDisplay from 'utils/getValueFiatToDisplay';

import MetricsTotalGlmLockedAndTotalSupplyProps from './types';
import { roundLockedRatio } from './utils';

const MetricsTotalGlmLockedAndTotalSupply: FC<MetricsTotalGlmLockedAndTotalSupplyProps> = ({
  isLoading = false,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { data: lockedSummaryLatest } = useLockedSummaryLatest();
  const {
    data: { displayCurrency },
  } = useSettingsStore(({ data }) => ({
    data: {
      displayCurrency: data.displayCurrency,
      isCryptoMainValueDisplay: data.isCryptoMainValueDisplay,
    },
  }));
  const { data: cryptoValues, error } = useCryptoValues(displayCurrency);

  const lockedRatioRounded = roundLockedRatio(lockedSummaryLatest?.lockedRatio);

  const lockedGlmTotalValue = useMemo(() => {
    if (!lockedSummaryLatest?.lockedTotal) {
      return '';
    }

    const lockedGlmTotalFloat = parseFloat(formatUnits(lockedSummaryLatest?.lockedTotal));

    return getFormattedValueWithSymbolSuffix({
      format: 'millions',
      precision: 3,
      value: lockedGlmTotalFloat,
    });
  }, [lockedSummaryLatest]);

  const lockedGlmTotalFiatValue = getValueFiatToDisplay({
    cryptoCurrency: 'golem',
    cryptoValues,
    displayCurrency,
    error,
    isUsingHairSpace: false,
    valueCrypto: lockedSummaryLatest?.lockedTotal,
  });

  return (
    <MetricsGridTile
      dataTest="MetricsTotalGlmLockedAndTotalSupply"
      groups={[
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              size="S"
              subvalue={lockedGlmTotalFiatValue}
              value={lockedGlmTotalValue}
            />
          ),
          title: t('totalGlmLocked'),
        },
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              isThinSubvalueLoader
              size="S"
              subvalue={<ProgressBar progressPercentage={lockedRatioRounded} variant="thin" />}
              value={`${lockedRatioRounded.toString()}%`}
            />
          ),
          title: t('of1BTotalSupply'),
        },
      ]}
      size="M"
    />
  );
};

export default MetricsTotalGlmLockedAndTotalSupply;
