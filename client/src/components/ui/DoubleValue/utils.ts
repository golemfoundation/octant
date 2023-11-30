import { BigNumber } from 'ethers';

import { Response } from 'api/calls/cryptoValues';
import { SettingsData } from 'store/settings/types';
import getNumberWithSpaces from 'utils/getNumberWithSpaces';
import getValueCryptoToDisplay from 'utils/getValueCryptoToDisplay';
import getValueFiatToDisplay from 'utils/getValueFiatToDisplay';

import DoubleValueProps from './types';

export function getValuesToDisplay({
  cryptoCurrency,
  cryptoValues,
  coinPricesServerDowntimeText = 'Conversion offline',
  displayCurrency,
  valueCrypto,
  valueString,
  isCryptoMainValueDisplay,
  error,
  shouldIgnoreGwei,
}: {
  coinPricesServerDowntimeText?: DoubleValueProps['coinPricesServerDowntimeText'];
  cryptoCurrency: DoubleValueProps['cryptoCurrency'];
  cryptoValues?: Response;
  displayCurrency: NonNullable<SettingsData['displayCurrency']>;
  error: any;
  isCryptoMainValueDisplay: SettingsData['isCryptoMainValueDisplay'];
  shouldIgnoreGwei?: DoubleValueProps['shouldIgnoreGwei'];
  valueCrypto?: BigNumber;
  valueString?: DoubleValueProps['valueString'];
}): {
  primary: string;
  secondary?: string;
} {
  if (valueString) {
    return {
      primary: getNumberWithSpaces(parseFloat(valueString).toFixed(2)),
    };
  }

  const valueCryptoToDisplay =
    valueString ||
    getValueCryptoToDisplay({
      cryptoCurrency,
      isUsingHairSpace: isCryptoMainValueDisplay,
      shouldIgnoreGwei,
      valueCrypto,
    });
  const valueFiatToDisplay = getValueFiatToDisplay({
    coinPricesServerDowntimeText,
    cryptoCurrency,
    cryptoValues,
    displayCurrency,
    error,
    isUsingHairSpace: !isCryptoMainValueDisplay,
    valueCrypto,
  });

  return isCryptoMainValueDisplay
    ? {
        primary: valueCryptoToDisplay,
        secondary: valueFiatToDisplay,
      }
    : {
        primary: valueFiatToDisplay,
        secondary: valueCryptoToDisplay,
      };
}
