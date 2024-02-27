import { CryptoCurrency } from 'types/cryptoCurrency';

import getFormattedEthValue from './getFormattedEthValue';
import getFormattedGlmValue from './getFormattedGlmValue';

export type ValueCryptoToDisplay = {
  cryptoCurrency?: CryptoCurrency;
  isUsingHairSpace?: boolean;
  shouldIgnoreGwei?: boolean;
  valueCrypto?: bigint;
};

export default function getValueCryptoToDisplay({
  cryptoCurrency,
  isUsingHairSpace = true,
  valueCrypto = BigInt(0),
  shouldIgnoreGwei,
}: ValueCryptoToDisplay): string {
  return cryptoCurrency === 'ethereum'
    ? getFormattedEthValue(valueCrypto, isUsingHairSpace, shouldIgnoreGwei).fullString
    : getFormattedGlmValue(valueCrypto, isUsingHairSpace).fullString;
}
