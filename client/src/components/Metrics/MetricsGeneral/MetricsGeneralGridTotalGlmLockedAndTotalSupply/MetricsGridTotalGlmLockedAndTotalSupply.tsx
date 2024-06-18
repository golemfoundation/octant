import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import ProgressBar from 'components/ui/ProgressBar';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useLockedSummaryLatest from 'hooks/subgraph/useLockedSummaryLatest';
import useSettingsStore from 'store/settings/store';
import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';
import getFormattedValueWithSymbolSuffix from 'utils/getFormattedValueWithSymbolSuffix';
import getValueFiatToDisplay from 'utils/getValueFiatToDisplay';

import styles from './MetricsGeneralGridTotalGlmLockedAndTotalSupply.module.scss';
import MetricsGeneralGridTotalGlmLockedAndTotalSupplyProps from './types';
import { roundLockedRatio } from './utils';

const MetricsGeneralGridTotalGlmLockedAndTotalSupply: FC<
  MetricsGeneralGridTotalGlmLockedAndTotalSupplyProps
> = ({ isLoading = false }) => {
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

    const lockedGlmTotalFloat = parseFloat(formatUnitsBigInt(lockedSummaryLatest?.lockedTotal));

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
      className={styles.root}
      dataTest="MetricsGeneralGridTotalGlmLockedAndTotalSupply"
      groups={[
        {
          children: (
            <MetricsGridTileValue
              dataTest="MetricsGeneralGridTotalGlmLockedAndTotalSupply__totalGlmLocked"
              isLoading={isLoading}
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

export default MetricsGeneralGridTotalGlmLockedAndTotalSupply;
