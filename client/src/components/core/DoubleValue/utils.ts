import { Response } from 'api/calls/cryptoValues';
import { SettingsData } from 'store/settings/types';
import getValueCryptoToDisplay from 'utils/getValueCryptoToDisplay';
import getValueFiatToDisplay from 'utils/getValueFiatToDisplay';

import DoubleValueProps from './types';

export function getValuesToDisplay({
  cryptoCurrency,
  cryptoValues,
  displayCurrency,
  valueCrypto,
  valueString,
  isCryptoMainValueDisplay,
  error,
}: {
  cryptoCurrency: DoubleValueProps['cryptoCurrency'];
  cryptoValues?: Response;
  displayCurrency: NonNullable<SettingsData['displayCurrency']>;
  error: any;
  isCryptoMainValueDisplay: SettingsData['isCryptoMainValueDisplay'];
  valueCrypto: DoubleValueProps['valueCrypto'];
  valueString?: DoubleValueProps['valueString'];
}): {
  primary?: string;
  secondary?: string;
} {
  if (valueString) {
    return {
      primary: valueString,
    };
  }

  const valueCryptoToDisplay = getValueCryptoToDisplay({
    cryptoCurrency,
    valueCrypto,
    valueString,
  });
  const valueFiatToDisplay = getValueFiatToDisplay({
    cryptoCurrency,
    cryptoValues,
    displayCurrency,
    error,
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
