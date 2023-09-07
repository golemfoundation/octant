import { parseUnits } from 'ethers/lib/utils';

import getValueFiatToDisplay from './getValueFiatToDisplay';

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

  const propsJPY = {
    cryptoCurrency: 'ethereum',
    cryptoValues: {
      ethereum: { jpy: 58242.84 },
      golem: { jpy: 1900.23 },
    },
    displayCurrency: 'jpy',
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

  it('should return 0.00 when there is a parameter missing', () => {
    expect(
      // @ts-expect-error error here is caused by lack of typing for defaultProps.
      getValueFiatToDisplay({
        ...defaultProps,
        cryptoCurrency: undefined,
      }),
    ).toEqual('$0.00');

    expect(
      // @ts-expect-error error here is caused by lack of typing for defaultProps.
      getValueFiatToDisplay({
        ...defaultProps,
        cryptoValues: undefined,
      }),
    ).toEqual('$0.00');

    expect(
      // @ts-expect-error error here is caused by lack of typing for defaultProps.
      getValueFiatToDisplay({
        ...defaultProps,
        valueCrypto: undefined,
      }),
    ).toEqual('$0.00');
  });

  it('should return the correct fiat value with prefix when all parameters are valid & isUsingHairSpace', () => {
    expect(
      // @ts-expect-error error here is caused by lack of typing for defaultProps.
      getValueFiatToDisplay({
        ...defaultProps,
      }),
    ).toEqual('$58\u200a242.34');
  });

  it('should return the correct fiat value with prefix when all parameters are valid & !isUsingHairSpace', () => {
    expect(
      // @ts-expect-error error here is caused by lack of typing for defaultProps.
      getValueFiatToDisplay({
        ...defaultProps,
        isUsingHairSpace: false,
      }),
    ).toEqual('$58 242.34');
  });

  it('should return fiat value in JPY as an integer & isUsingHairSpace', () => {
    expect(
      // @ts-expect-error error here is caused by lack of typing for defaultProps.
      getValueFiatToDisplay({
        ...propsJPY,
      }),
    ).toEqual('JPY 58\u200a243');
  });

  it('should return fiat value in JPY as an integer & !isUsingHairSpace', () => {
    expect(
      // @ts-expect-error error here is caused by lack of typing for defaultProps.
      getValueFiatToDisplay({
        ...propsJPY,
        isUsingHairSpace: false,
      }),
    ).toEqual('JPY 58 243');
  });
});
