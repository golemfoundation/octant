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
    expectedValue: '<0.0001Ξ',
    shouldIgnoreGwei: true,
    showShortFormat: true,
  },
  { argument: BigInt(10) ** BigInt(19) - BigInt(1), expectedValue: '10Ξ', showShortFormat: true },
  { argument: BigInt(10) ** BigInt(19), expectedValue: '10Ξ', showShortFormat: true },
  { argument: BigInt(10) ** BigInt(20) - BigInt(1), expectedValue: '100Ξ', showShortFormat: true },
  { argument: BigInt(10) ** BigInt(20), expectedValue: '100Ξ', showShortFormat: true },
  { argument: BigInt(10) ** BigInt(21) - BigInt(1), expectedValue: '1000Ξ', showShortFormat: true },
  { argument: BigInt(10) ** BigInt(21), expectedValue: '1000Ξ', showShortFormat: true },
  {
    argument: BigInt(10) ** BigInt(22) - BigInt(1),
    expectedValue: '10\u200a000Ξ',
    showShortFormat: true,
  },
  { argument: BigInt(10) ** BigInt(22), expectedValue: '10\u200a000Ξ', showShortFormat: true },

  { argument: BigInt(10) ** BigInt(15), expectedValue: '0.001 ETH', maxNumberOfDigitsToShow: 5 },
  {
    argument: BigInt(10) ** BigInt(16) - BigInt(1),
    expectedValue: '0.01 ETH',
    maxNumberOfDigitsToShow: 5,
  },
  { argument: BigInt(10) ** BigInt(16), expectedValue: '0.01 ETH', maxNumberOfDigitsToShow: 5 },
  {
    argument: BigInt(10) ** BigInt(17) - BigInt(1),
    expectedValue: '0.1 ETH',
    maxNumberOfDigitsToShow: 5,
  },
  { argument: BigInt(10) ** BigInt(17), expectedValue: '0.1 ETH', maxNumberOfDigitsToShow: 5 },
  {
    argument: BigInt(10) ** BigInt(18) - BigInt(1),
    expectedValue: '1 ETH',
    maxNumberOfDigitsToShow: 5,
  },
  { argument: BigInt(10) ** BigInt(18), expectedValue: '1 ETH', maxNumberOfDigitsToShow: 5 },
  {
    argument: BigInt(10) ** BigInt(19) - BigInt(1),
    expectedValue: '10 ETH',
    maxNumberOfDigitsToShow: 5,
  },
  { argument: BigInt(10) ** BigInt(19), expectedValue: '10 ETH', maxNumberOfDigitsToShow: 5 },
  {
    argument: BigInt(10) ** BigInt(20) - BigInt(1),
    expectedValue: '100 ETH',
    maxNumberOfDigitsToShow: 5,
  },
  { argument: BigInt(10) ** BigInt(20), expectedValue: '100 ETH', maxNumberOfDigitsToShow: 5 },
  {
    argument: BigInt(10) ** BigInt(21) - BigInt(1),
    expectedValue: '1000 ETH',
    maxNumberOfDigitsToShow: 5,
  },
  { argument: BigInt(10) ** BigInt(21), expectedValue: '1000 ETH', maxNumberOfDigitsToShow: 5 },
  {
    argument: BigInt(10) ** BigInt(22) - BigInt(1),
    expectedValue: '10\u200a000 ETH',
    maxNumberOfDigitsToShow: 5,
  },
  {
    argument: 12345678900000n,
    expectedValue: '<0.0001 ETH',
    maxNumberOfDigitsToShow: 5,
    shouldIgnoreGwei: true,
  },
  {
    argument: 12345678900000n,
    expectedValue: '<0.0001 ETH',
    maxNumberOfDigitsToShow: 5,
    shouldIgnoreGwei: true,
  },
  {
    argument: 123456789000000n,
    expectedValue: '0.0001 ETH',
    maxNumberOfDigitsToShow: 5,
  },
  {
    argument: 1234567890000000n,
    expectedValue: '0.0012 ETH',
    maxNumberOfDigitsToShow: 5,
  },
  {
    argument: 12345678900000000n,
    expectedValue: '0.0123 ETH',
    maxNumberOfDigitsToShow: 5,
  },
  {
    argument: 123456789000000000n,
    expectedValue: '0.1235 ETH',
    maxNumberOfDigitsToShow: 5,
  },
  {
    argument: 1234567890000000000n,
    expectedValue: '1.2346 ETH',
    maxNumberOfDigitsToShow: 5,
  },
  {
    argument: 12345678900000000000n,
    expectedValue: '12.346 ETH',
    maxNumberOfDigitsToShow: 5,
  },
  {
    argument: 123456789000000000000n,
    expectedValue: '123.46 ETH',
    maxNumberOfDigitsToShow: 5,
  },
  {
    argument: 1234567890000000000000n,
    expectedValue: '1234.6 ETH',
    maxNumberOfDigitsToShow: 5,
  },
  {
    argument: 12345678900000000000000n,
    expectedValue: '12\u200a346 ETH',
    maxNumberOfDigitsToShow: 5,
  },

  {
    argument: 123456789000000000000n,
    expectedValue: '123.46Ξ',
    maxNumberOfDigitsToShow: 5,
    showShortFormat: true,
  },
  {
    argument: 1234567890000000000000n,
    expectedValue: '1234.6Ξ',
    maxNumberOfDigitsToShow: 5,
    showShortFormat: true,
  },
  {
    argument: 12345678900000000000000n,
    expectedValue: '12\u200a346Ξ',
    maxNumberOfDigitsToShow: 5,
    showShortFormat: true,
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
          maxNumberOfDigitsToShow,
          numberOfDecimalPlaces: ethPrecission,
          shouldIgnoreGwei,
          shouldIgnoreWei,
          showShortFormat,
          value: argument,
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
          maxNumberOfDigitsToShow,
          numberOfDecimalPlaces: ethPrecission,
          shouldIgnoreGwei,
          shouldIgnoreWei,
          showShortFormat,
          value: argument,
        }).fullString,
      ).toBe(expectedValueNormalSpace);
    });
  }
});
