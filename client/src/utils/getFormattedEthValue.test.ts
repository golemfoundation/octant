import { formatUnitsBigInt } from './formatUnitsBigInt';
import getFormattedEthValue from './getFormattedEthValue';

const testCases = [
  { argument: BigInt(0), expectedValue: '0 ETH' },
  { argument: BigInt(0), expectedValue: '0 ETH', shouldIgnoreWei: true },
  { argument: BigInt(0), expectedValue: '0 ETH', shouldIgnoreGwei: true },
  { argument: BigInt(10) ** BigInt(0), expectedValue: '1 WEI' },
  { argument: BigInt(10) ** BigInt(0), expectedValue: '<0.0001 ETH', shouldIgnoreWei: true },
  { argument: BigInt(10) ** BigInt(1) - BigInt(1), expectedValue: '9 WEI' },
  {
    argument: BigInt(10) ** BigInt(1) - BigInt(1),
    expectedValue: '<0.0001 ETH',
    shouldIgnoreWei: true,
  },
  { argument: BigInt(10) ** BigInt(1), expectedValue: '10 WEI' },
  { argument: BigInt(10) ** BigInt(1), expectedValue: '<0.0001 ETH', shouldIgnoreWei: true },
  { argument: BigInt(10) ** BigInt(2) - BigInt(1), expectedValue: '99 WEI' },
  {
    argument: BigInt(10) ** BigInt(2) - BigInt(1),
    expectedValue: '<0.0001 ETH',
    shouldIgnoreWei: true,
  },
  { argument: BigInt(10) ** BigInt(2), expectedValue: '100 WEI' },
  { argument: BigInt(10) ** BigInt(2), expectedValue: '<0.0001 ETH', shouldIgnoreWei: true },
  { argument: BigInt(10) ** BigInt(3) - BigInt(1), expectedValue: '999 WEI' },
  {
    argument: BigInt(10) ** BigInt(3) - BigInt(1),
    expectedValue: '<0.0001 ETH',
    shouldIgnoreWei: true,
  },
  { argument: BigInt(10) ** BigInt(3), expectedValue: '1000 WEI' },
  { argument: BigInt(10) ** BigInt(3), expectedValue: '<0.0001 ETH', shouldIgnoreWei: true },
  { argument: BigInt(10) ** BigInt(4) - BigInt(1), expectedValue: '9999 WEI' },
  {
    argument: BigInt(10) ** BigInt(4) - BigInt(1),
    expectedValue: '<0.0001 ETH',
    shouldIgnoreWei: true,
  },
  { argument: BigInt(10) ** BigInt(4), expectedValue: '10\u200a000 WEI' },
  { argument: BigInt(10) ** BigInt(4), expectedValue: '<0.0001 ETH', shouldIgnoreWei: true },
  { argument: BigInt(10) ** BigInt(5) - BigInt(1), expectedValue: '99\u200a999 WEI' },
  {
    argument: BigInt(10) ** BigInt(5) - BigInt(1),
    expectedValue: '<0.0001 ETH',
    shouldIgnoreWei: true,
  },
  {
    argument: BigInt(10) ** BigInt(5) - BigInt(1),
    expectedValue: '99\u200a999 WEI',
    shouldIgnoreGwei: true,
  },

  { argument: BigInt(10) ** BigInt(5), expectedValue: '0 GWEI' },
  { argument: BigInt(10) ** BigInt(5), expectedValue: '0 GWEI', shouldIgnoreWei: true },
  {
    argument: BigInt(10) ** BigInt(5),
    expectedValue: '<0.0001 ETH',
    shouldIgnoreGwei: true,
  },
  { argument: BigInt(10) ** BigInt(6) - BigInt(1), expectedValue: '0 GWEI' },
  { argument: BigInt(10) ** BigInt(6), expectedValue: '0 GWEI' },
  { argument: BigInt(10) ** BigInt(7) - BigInt(1), expectedValue: '0 GWEI' },
  { argument: BigInt(10) ** BigInt(7), expectedValue: '0 GWEI' },
  { argument: BigInt(10) ** BigInt(8) - BigInt(1), expectedValue: '0 GWEI' },
  { argument: BigInt(10) ** BigInt(8), expectedValue: '0 GWEI' },
  { argument: BigInt(10) ** BigInt(9) - BigInt(1), expectedValue: '1 GWEI' },
  {
    argument: BigInt(10) ** BigInt(9) - BigInt(1),
    expectedValue: '<0.0001 ETH',
    shouldIgnoreGwei: true,
  },
  { argument: BigInt(10) ** BigInt(9), expectedValue: '1 GWEI' },
  { argument: BigInt(10) ** BigInt(10) - BigInt(1), expectedValue: '10 GWEI' },
  { argument: BigInt(10) ** BigInt(10), expectedValue: '10 GWEI' },
  { argument: BigInt(10) ** BigInt(11) - BigInt(1), expectedValue: '100 GWEI' },
  { argument: BigInt(10) ** BigInt(11), expectedValue: '100 GWEI' },
  { argument: BigInt(10) ** BigInt(12) - BigInt(1), expectedValue: '1000 GWEI' },
  { argument: BigInt(10) ** BigInt(12), expectedValue: '1000 GWEI' },
  { argument: BigInt(10) ** BigInt(13) - BigInt(1), expectedValue: '10\u200a000 GWEI' },
  { argument: BigInt(10) ** BigInt(13), expectedValue: '10\u200a000 GWEI' },
  { argument: BigInt(10) ** BigInt(14) - BigInt(1), expectedValue: '100\u200a000 GWEI' },
  {
    argument: BigInt(10) ** BigInt(14) - BigInt(1),
    expectedValue: '<0.0001 ETH',
    shouldIgnoreGwei: true,
  },
  { argument: BigInt(10) ** BigInt(14), expectedValue: '0.0001 ETH' },
  { argument: BigInt(10) ** BigInt(15) - BigInt(1), expectedValue: '0.001 ETH' },
  { argument: BigInt(10) ** BigInt(15) - BigInt(1), ethPrecission: 1, expectedValue: '0 ETH' },
  { argument: BigInt(10) ** BigInt(15) - BigInt(1), ethPrecission: 2, expectedValue: '0 ETH' },
  { argument: BigInt(10) ** BigInt(15) - BigInt(1), ethPrecission: 3, expectedValue: '0.001 ETH' },
  { argument: BigInt(10) ** BigInt(15) - BigInt(1), ethPrecission: 4, expectedValue: '0.001 ETH' },
  { argument: BigInt(10) ** BigInt(15), expectedValue: '0.001 ETH' },
  { argument: BigInt(10) ** BigInt(16) - BigInt(1), expectedValue: '0.01 ETH' },
  { argument: BigInt(10) ** BigInt(16), expectedValue: '0.01 ETH' },
  { argument: BigInt(10) ** BigInt(17) - BigInt(1), expectedValue: '0.1 ETH' },
  { argument: BigInt(10) ** BigInt(17), expectedValue: '0.1 ETH' },
  { argument: BigInt(10) ** BigInt(18) - BigInt(1), expectedValue: '1 ETH' },
  { argument: BigInt(10) ** BigInt(18), expectedValue: '1 ETH' },
  { argument: BigInt(10) ** BigInt(19) - BigInt(1), expectedValue: '10 ETH' },
  { argument: BigInt(10) ** BigInt(19), expectedValue: '10 ETH' },
  { argument: BigInt(10) ** BigInt(20) - BigInt(1), expectedValue: '100 ETH' },
  { argument: BigInt(10) ** BigInt(20), expectedValue: '100 ETH' },
  { argument: BigInt(10) ** BigInt(21) - BigInt(1), expectedValue: '1000 ETH' },
  { argument: BigInt(10) ** BigInt(21), expectedValue: '1000 ETH' },
  { argument: BigInt(10) ** BigInt(22) - BigInt(1), expectedValue: '10\u200a000 ETH' },
  { argument: BigInt(10) ** BigInt(22), expectedValue: '10\u200a000 ETH' },

  {
    argument: BigInt(10) ** BigInt(13) - BigInt(1),
    showShortFormat: true,
    shouldIgnoreGwei: true,
    expectedValue: '<0.0001Ξ',
  },
  { argument: BigInt(10) ** BigInt(19) - BigInt(1), showShortFormat: true, expectedValue: '10Ξ' },
  { argument: BigInt(10) ** BigInt(19), showShortFormat: true, expectedValue: '10Ξ' },
  { argument: BigInt(10) ** BigInt(20) - BigInt(1), showShortFormat: true, expectedValue: '100Ξ' },
  { argument: BigInt(10) ** BigInt(20), showShortFormat: true, expectedValue: '100Ξ' },
  { argument: BigInt(10) ** BigInt(21) - BigInt(1), showShortFormat: true, expectedValue: '1000Ξ' },
  { argument: BigInt(10) ** BigInt(21), showShortFormat: true, expectedValue: '1000Ξ' },
  {
    argument: BigInt(10) ** BigInt(22) - BigInt(1),
    showShortFormat: true,
    expectedValue: '10\u200a000Ξ',
  },
  { argument: BigInt(10) ** BigInt(22), showShortFormat: true, expectedValue: '10\u200a000Ξ' },

  { argument: BigInt(10) ** BigInt(15), maxNumberOfDigitsToShow: 5, expectedValue: '0.001 ETH' },
  {
    argument: BigInt(10) ** BigInt(16) - BigInt(1),
    maxNumberOfDigitsToShow: 5,
    expectedValue: '0.01 ETH',
  },
  { argument: BigInt(10) ** BigInt(16), maxNumberOfDigitsToShow: 5, expectedValue: '0.01 ETH' },
  {
    argument: BigInt(10) ** BigInt(17) - BigInt(1),
    maxNumberOfDigitsToShow: 5,
    expectedValue: '0.1 ETH',
  },
  { argument: BigInt(10) ** BigInt(17), maxNumberOfDigitsToShow: 5, expectedValue: '0.1 ETH' },
  {
    argument: BigInt(10) ** BigInt(18) - BigInt(1),
    maxNumberOfDigitsToShow: 5,
    expectedValue: '1 ETH',
  },
  { argument: BigInt(10) ** BigInt(18), maxNumberOfDigitsToShow: 5, expectedValue: '1 ETH' },
  {
    argument: BigInt(10) ** BigInt(19) - BigInt(1),
    maxNumberOfDigitsToShow: 5,
    expectedValue: '10 ETH',
  },
  { argument: BigInt(10) ** BigInt(19), maxNumberOfDigitsToShow: 5, expectedValue: '10 ETH' },
  {
    argument: BigInt(10) ** BigInt(20) - BigInt(1),
    maxNumberOfDigitsToShow: 5,
    expectedValue: '100 ETH',
  },
  { argument: BigInt(10) ** BigInt(20), maxNumberOfDigitsToShow: 5, expectedValue: '100 ETH' },
  {
    argument: BigInt(10) ** BigInt(21) - BigInt(1),
    maxNumberOfDigitsToShow: 5,
    expectedValue: '1000 ETH',
  },
  { argument: BigInt(10) ** BigInt(21), maxNumberOfDigitsToShow: 5, expectedValue: '1000 ETH' },
  {
    argument: BigInt(10) ** BigInt(22) - BigInt(1),
    maxNumberOfDigitsToShow: 5,
    expectedValue: '10\u200a000 ETH',
  },
  {
    argument: 12345678900000n,
    maxNumberOfDigitsToShow: 5,
    shouldIgnoreGwei: true,
    expectedValue: '<0.0001 ETH',
  },
  {
    argument: 12345678900000n,
    maxNumberOfDigitsToShow: 5,
    shouldIgnoreGwei: true,
    expectedValue: '<0.0001 ETH',
  },
  {
    argument: 123456789000000n,
    maxNumberOfDigitsToShow: 5,
    expectedValue: '0.0001 ETH',
  },
  {
    argument: 1234567890000000n,
    maxNumberOfDigitsToShow: 5,
    expectedValue: '0.0012 ETH',
  },
  {
    argument: 12345678900000000n,
    maxNumberOfDigitsToShow: 5,
    expectedValue: '0.0123 ETH',
  },
  {
    argument: 123456789000000000n,
    maxNumberOfDigitsToShow: 5,
    expectedValue: '0.1235 ETH',
  },
  {
    argument: 1234567890000000000n,
    maxNumberOfDigitsToShow: 5,
    expectedValue: '1.2346 ETH',
  },
  {
    argument: 12345678900000000000n,
    maxNumberOfDigitsToShow: 5,
    expectedValue: '12.346 ETH',
  },
  {
    argument: 123456789000000000000n,
    maxNumberOfDigitsToShow: 5,
    expectedValue: '123.46 ETH',
  },
  {
    argument: 1234567890000000000000n,
    maxNumberOfDigitsToShow: 5,
    expectedValue: '1234.6 ETH',
  },
  {
    argument: 12345678900000000000000n,
    maxNumberOfDigitsToShow: 5,
    expectedValue: '12\u200a346 ETH',
  },

  {
    argument: 123456789000000000000n,
    maxNumberOfDigitsToShow: 5,
    showShortFormat: true,
    expectedValue: '123.46Ξ',
  },
  {
    argument: 1234567890000000000000n,
    maxNumberOfDigitsToShow: 5,
    showShortFormat: true,
    expectedValue: '1234.6Ξ',
  },
  {
    argument: 12345678900000000000000n,
    maxNumberOfDigitsToShow: 5,
    showShortFormat: true,
    expectedValue: '12\u200a346Ξ',
  },
];

describe('getFormattedEthValue', () => {
  for (const {
    argument,
    expectedValue,
    shouldIgnoreGwei,
    shouldIgnoreWei,
    ethPrecission,
    maxNumberOfDigitsToShow,
    showShortFormat,
  } of testCases) {
    it(`returns ${expectedValue} for an argument ${formatUnitsBigInt(
      argument,
    )} when isUsingHairSpace`, () => {
      expect(
        getFormattedEthValue({
          isUsingHairSpace: true,
          numberOfDecimalPlaces: ethPrecission,
          shouldIgnoreGwei,
          shouldIgnoreWei,
          value: argument,
          maxNumberOfDigitsToShow,
          showShortFormat,
        }).fullString,
      ).toBe(expectedValue);
    });

    const expectedValueNormalSpace = expectedValue.replace(/\u200a/g, ' ');
    it(`returns ${expectedValueNormalSpace} for an argument ${formatUnitsBigInt(
      argument,
    )} when !isUsingHairSpace`, () => {
      expect(
        getFormattedEthValue({
          isUsingHairSpace: false,
          numberOfDecimalPlaces: ethPrecission,
          shouldIgnoreGwei,
          shouldIgnoreWei,
          value: argument,
          maxNumberOfDigitsToShow,
          showShortFormat,
        }).fullString,
      ).toBe(expectedValueNormalSpace);
    });
  }
});
