import { parseUnits } from 'ethers/lib/utils';

import getFormattedEthValue from './getFormattedEthValue';
import getFormattedGlmValue from './getFormattedGlmValue';
import getValueCryptoToDisplay from './getValueCryptoToDisplay';

describe('getValueCryptoToDisplay', () => {
  test('returns "0 ETH" if valueCrypto is 0', () => {
    const valueCrypto = parseUnits('0');
    const cryptoCurrency = 'ethereum';
    expect(getValueCryptoToDisplay({ cryptoCurrency, valueCrypto })).toBe('0 ETH');
  });

  test('returns the formatted ETH value if cryptoCurrency is ethereum', () => {
    const valueCrypto = parseUnits('1');
    const cryptoCurrency = 'ethereum';
    const formattedEthValue = getFormattedEthValue(valueCrypto, true).fullString;
    expect(getValueCryptoToDisplay({ cryptoCurrency, valueCrypto })).toBe(formattedEthValue);
  });

  test('returns the formatted crypto value and ticker if cryptoCurrency is not ethereum', () => {
    const valueCrypto = parseUnits('1');
    const cryptoCurrency = 'golem';
    const formattedCryptoValue = getFormattedGlmValue(valueCrypto, true).fullString;
    expect(getValueCryptoToDisplay({ cryptoCurrency, valueCrypto })).toBe(formattedCryptoValue);
  });
});
