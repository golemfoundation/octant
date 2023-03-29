import { formatUnits, parseUnits } from 'ethers/lib/utils';

import getFormattedEthValue from './getFormattedEthValue';
import getValueCryptoToDisplay from './getValueCryptoToDisplay';

describe('getValueCryptoToDisplay', () => {
  test('returns valueString if valueString exists', () => {
    const valueString = '0.5 ETH';
    const valueCrypto = parseUnits('1');
    const cryptoCurrency = 'ethereum';
    expect(getValueCryptoToDisplay({ cryptoCurrency, valueCrypto, valueString })).toBe(valueString);
  });

  test('returns "0 ETH" if valueCrypto is 0', () => {
    const valueString = '';
    const valueCrypto = parseUnits('0');
    const cryptoCurrency = 'ethereum';
    expect(getValueCryptoToDisplay({ cryptoCurrency, valueCrypto, valueString })).toBe('0 ETH');
  });

  test('returns the formatted ETH value if cryptoCurrency is ethereum', () => {
    const valueString = '';
    const valueCrypto = parseUnits('1');
    const cryptoCurrency = 'ethereum';
    const formattedEthValue = getFormattedEthValue(valueCrypto).fullString;
    expect(getValueCryptoToDisplay({ cryptoCurrency, valueCrypto, valueString })).toBe(
      formattedEthValue,
    );
  });

  test('returns the formatted crypto value and ticker if cryptoCurrency is not ethereum', () => {
    const valueString = '';
    const valueCrypto = parseUnits('1');
    const cryptoCurrency = 'golem';
    const cryptoTicker = 'GLM';
    const formattedCryptoValue = `${formatUnits(valueCrypto)} ${cryptoTicker}`;
    expect(getValueCryptoToDisplay({ cryptoCurrency, valueCrypto, valueString })).toBe(
      formattedCryptoValue,
    );
  });
});
