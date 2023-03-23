import { formatUnits, parseUnits } from 'ethers/lib/utils';

import getFormattedEthValue from 'utils/getFormattedEthValue';

import { getValueFiatToDisplay, getValueCryptoToDisplay, getValuesToDisplay } from './utils';

describe('getValueFiatToDisplay', () => {
  const defaultProps = {
    cryptoCurrency: 'ethereum',
    cryptoValues: {
      ethereum: { usd: 58242.34 },
      golem: { usd: 1900.23 },
    },
    displayCurrency: 'usd',
    error: null,
    valueCrypto: parseUnits('1'),
  };

  it('should return "Conversion offline" if error is truthy', () => {
    expect(
      // @ts-expect-error error here is caused by lack of typing for defaultProps.
      getValueFiatToDisplay({
        ...defaultProps,
        error: true,
      }),
    ).toEqual('Conversion offline');

    expect(
      // @ts-expect-error error here is caused by lack of typing for defaultProps.
      getValueFiatToDisplay({
        ...defaultProps,
        error: new Error('Conversion error'),
      }),
    ).toEqual('Conversion offline');
  });

  it('should return the correct fiat value with prefix when all parameters are valid', () => {
    expect(
      // @ts-expect-error error here is caused by lack of typing for defaultProps.
      getValueFiatToDisplay({
        ...defaultProps,
      }),
    ).toEqual('$ 58242.34');
  });
});

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

describe('getValuesToDisplay', () => {
  const defaultProps = {
    cryptoCurrency: 'ethereum',
    cryptoValues: {
      ethereum: {
        usd: 4000,
      },
      golem: {
        usd: 25,
      },
    },
    displayCurrency: 'usd',
    error: null,
    isCryptoMainValueDisplay: true,
    valueCrypto: parseUnits('0.5'),
    valueString: '1.0',
  };

  it('should return primary value if valueString is provided', () => {
    // @ts-expect-error error here is caused by lack of typing for defaultProps.
    expect(getValuesToDisplay({ ...defaultProps })).toEqual({ primary: defaultProps.valueString });
  });

  it('should return primary and secondary values for isCryptoMainValueDisplay = true', () => {
    expect(
      // @ts-expect-error error here is caused by lack of typing for defaultProps.
      getValuesToDisplay({
        ...defaultProps,
        valueString: undefined,
      }),
    ).toEqual({
      primary: '0.5 ETH',
      secondary: '$ 2000.00',
    });
  });

  it('should return primary and secondary values for isCryptoMainValueDisplay = false', () => {
    expect(
      // @ts-expect-error error here is caused by lack of typing for defaultProps.
      getValuesToDisplay({
        ...defaultProps,
        isCryptoMainValueDisplay: false,
        valueString: undefined,
      }),
    ).toEqual({
      primary: '$ 2000.00',
      secondary: '0.5 ETH',
    });
  });

  it('should return "Conversion offline" if error is provided', () => {
    expect(
      // @ts-expect-error error here is caused by lack of typing for defaultProps.
      getValuesToDisplay({
        ...defaultProps,
        error: 'some error',
        isCryptoMainValueDisplay: false,
        valueString: undefined,
      }),
    ).toEqual({
      primary: 'Conversion offline',
      secondary: '0.5 ETH',
    });
  });
});
