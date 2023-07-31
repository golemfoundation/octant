import { parseUnits } from 'ethers/lib/utils';

import { getValuesToDisplay } from './utils';

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
    expect(getValuesToDisplay({ ...defaultProps })).toEqual({ primary: '1.00' });
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
