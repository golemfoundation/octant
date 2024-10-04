import {
  comma,
  dotAndZeroes,
  floatNumberWithUpTo18DecimalPlaces,
  floatNumberWithUpTo2DecimalPlaces,
  floatNumberWithUpTo9DecimalPlaces,
  groupingNumbersUpTo3,
  numbersOnly,
  percentageOnly,
  ethAddress,
  epochNumberGrabber,
} from './regExp';

const regExpTestCases = [
  {
    name: 'floatNumberWithUpTo2DecimalPlaces',
    regExp: floatNumberWithUpTo2DecimalPlaces,
    testCases: [
      { expectedValue: true, test: '1' },
      { expectedValue: true, test: '1.0' },
      { expectedValue: true, test: '1.00' },
      { expectedValue: false, test: '1.000' },
      { expectedValue: false, test: '1.0000' },
      { expectedValue: false, test: '1.00000' },
      { expectedValue: false, test: '1.000000' },
      { expectedValue: true, test: '1.' },
      { expectedValue: false, test: '.000000000000000000' },
      { expectedValue: false, test: '1.a' },
      { expectedValue: false, test: '1.-' },
      { expectedValue: false, test: 'abc' },
      { expectedValue: false, test: '+123123123' },
      { expectedValue: false, test: '+12312awdawda' },
      { expectedValue: false, test: '+adawdawd' },
      { expectedValue: false, test: 'adawdawd' },
      { expectedValue: false, test: 'test' },
      { expectedValue: false, test: '+673829123' },
      { expectedValue: false, test: '/13123123123123' },
      { expectedValue: true, test: '999999999' },
    ],
  },
  {
    name: 'floatNumberWithUpTo9DecimalPlaces',
    regExp: floatNumberWithUpTo9DecimalPlaces,
    testCases: [
      { expectedValue: true, test: '1' },
      { expectedValue: true, test: '1.0' },
      { expectedValue: true, test: '1.000' },
      { expectedValue: true, test: '1.0000' },
      { expectedValue: true, test: '1.00000' },
      { expectedValue: true, test: '1.000000' },
      { expectedValue: true, test: '1.0000000' },
      { expectedValue: true, test: '1.00000000' },
      { expectedValue: true, test: '1.000000000' },
      { expectedValue: false, test: '1.0000000000' },
      { expectedValue: false, test: '1.00000000000' },
      { expectedValue: false, test: '1.000000000000' },
      { expectedValue: false, test: '1.0000000000000' },
      { expectedValue: false, test: '1.00000000000000' },
      { expectedValue: false, test: '1.000000000000000' },
      { expectedValue: false, test: '1.000000000000000' },
      { expectedValue: false, test: '1.0000000000000000' },
      { expectedValue: false, test: '1.000000000000000000' }, // 18 decimal places
      { expectedValue: false, test: '1.0000000000000000000' }, // 19 decimal places
      { expectedValue: true, test: '1.' },
      { expectedValue: false, test: '.000000000000000000' },
      { expectedValue: false, test: '1.a' },
      { expectedValue: false, test: '1.-' },
      { expectedValue: false, test: 'abc' },
      { expectedValue: false, test: '+123123123' },
      { expectedValue: false, test: '+12312awdawda' },
      { expectedValue: false, test: '+adawdawd' },
      { expectedValue: false, test: 'adawdawd' },
      { expectedValue: false, test: 'test' },
      { expectedValue: false, test: '+673829123' },
      { expectedValue: false, test: '/13123123123123' },
      { expectedValue: true, test: '999999999' },
    ],
  },
  {
    name: 'floatNumberWithUpTo18DecimalPlaces',
    regExp: floatNumberWithUpTo18DecimalPlaces,
    testCases: [
      { expectedValue: true, test: '1' },
      { expectedValue: true, test: '1.0' },
      { expectedValue: true, test: '1.000' },
      { expectedValue: true, test: '1.0000' },
      { expectedValue: true, test: '1.00000' },
      { expectedValue: true, test: '1.000000' },
      { expectedValue: true, test: '1.0000000' },
      { expectedValue: true, test: '1.00000000' },
      { expectedValue: true, test: '1.000000000' },
      { expectedValue: true, test: '1.0000000000' },
      { expectedValue: true, test: '1.00000000000' },
      { expectedValue: true, test: '1.000000000000' },
      { expectedValue: true, test: '1.0000000000000' },
      { expectedValue: true, test: '1.00000000000000' },
      { expectedValue: true, test: '1.000000000000000' },
      { expectedValue: true, test: '1.000000000000000' },
      { expectedValue: true, test: '1.0000000000000000' },
      { expectedValue: true, test: '1.000000000000000000' }, // 18 decimal places
      { expectedValue: false, test: '1.0000000000000000000' }, // 19 decimal places
      { expectedValue: true, test: '1.' },
      { expectedValue: false, test: '.000000000000000000' },
      { expectedValue: false, test: '1.a' },
      { expectedValue: false, test: '1.-' },
      { expectedValue: false, test: 'abc' },
      { expectedValue: false, test: '+123123123' },
      { expectedValue: false, test: '+12312awdawda' },
      { expectedValue: false, test: '+adawdawd' },
      { expectedValue: false, test: 'adawdawd' },
      { expectedValue: false, test: 'test' },
      { expectedValue: false, test: '+673829123' },
      { expectedValue: false, test: '/13123123123123' },
      { expectedValue: true, test: '999999999' },
    ],
  },
  {
    name: 'numbersOnly',
    regExp: numbersOnly,
    testCases: [
      { expectedValue: true, test: '1' },
      { expectedValue: true, test: '1234567890' },
      { expectedValue: true, test: '0123456789' },
      { expectedValue: false, test: '0123456789a' },
      { expectedValue: false, test: '0123456789.' },
      { expectedValue: false, test: 'a0123456789' },
      { expectedValue: false, test: '.0123456789' },
      { expectedValue: false, test: '01234a56789' },
      { expectedValue: false, test: '01234.56789' },
    ],
  },
  {
    name: 'dotAndZeroes',
    regExp: dotAndZeroes,
    testCases: [
      { expectedValue: true, test: '0' },
      { expectedValue: true, test: '0.0' },
      { expectedValue: true, test: '0.00' },
      { expectedValue: true, test: '0.000' },
      { expectedValue: false, test: '0.001' },
      { expectedValue: false, test: '0.0012' },
      { expectedValue: true, test: '0.001200' },
      { expectedValue: false, test: '1.' },
      { expectedValue: true, test: '1.0' },
      { expectedValue: true, test: '12.0' },
      { expectedValue: false, test: '12.01' },
    ],
  },
  {
    name: 'comma',
    regExp: comma,
    testCases: [
      { expectedValue: false, test: '0' },
      { expectedValue: true, test: '0,0' },
      { expectedValue: true, test: '0,00' },
      { expectedValue: true, test: '0,000' },
      { expectedValue: false, test: '0.000' },
      { expectedValue: false, test: '0.001' },
      { expectedValue: true, test: '0,001200' },
      { expectedValue: false, test: '1.' },
      { expectedValue: true, test: '1,0' },
      { expectedValue: true, test: '12,0' },
      { expectedValue: false, test: '12.01' },
    ],
  },
  {
    name: 'percentageOnly',
    regExp: percentageOnly,
    testCases: [
      { expectedValue: false, test: '0,0' },
      { expectedValue: false, test: '0,00' },
      { expectedValue: false, test: '0.0' },
      { expectedValue: false, test: '0.00' },
      { expectedValue: false, test: '0.001' },
      { expectedValue: false, test: '101' },
      { expectedValue: false, test: '100.0' },
      { expectedValue: false, test: '100.00' },
      { expectedValue: false, test: '100,0' },
      { expectedValue: false, test: '100,00' },
      { expectedValue: false, test: '100.01' },
      { expectedValue: false, test: '100,01' },
      { expectedValue: true, test: '0' },
      { expectedValue: true, test: '100' },
      { expectedValue: true, test: '1' },
      { expectedValue: true, test: '99' },
      { expectedValue: true, test: '19' },
      { expectedValue: true, test: '35' },
      { expectedValue: true, test: '9' },
      { expectedValue: true, test: '68' },
    ],
  },
  {
    name: 'groupingNumbersUpTo3',
    regExp: groupingNumbersUpTo3,
    testCases: [
      { expectedValue: false, test: '0' },
      { expectedValue: false, test: '0,0' },
      { expectedValue: false, test: '0.0' },
      { expectedValue: false, test: '1' },
      { expectedValue: false, test: '1.0' },
      { expectedValue: false, test: '1,0' },
      { expectedValue: false, test: '10' },
      { expectedValue: false, test: '10.0' },
      { expectedValue: false, test: '10,0' },
      { expectedValue: false, test: '100' },
      { expectedValue: false, test: '100.0' },
      { expectedValue: false, test: '100,0' },
      { expectedValue: true, test: '1000' },
      { expectedValue: true, test: '1000.0' },
      { expectedValue: true, test: '1000,0' },
      { expectedValue: true, test: '10000' },
      { expectedValue: true, test: '10000.0' },
      { expectedValue: true, test: '10000,0' },
      { expectedValue: true, test: '100000' },
      { expectedValue: true, test: '100000.0' },
      { expectedValue: true, test: '100000,0' },
      { expectedValue: true, test: '1000000' },
      { expectedValue: true, test: '1000000.0' },
      { expectedValue: true, test: '1000000,0' },
    ],
  },
  {
    name: 'ethAddress',
    regExp: ethAddress,
    testCases: [
      { expectedValue: true, test: '0xb794f5ea0ba39494ce839613fffba74279579268' },
      { expectedValue: false, test: 'xb794f5ea0ba39494ce839613fffba74279579268' },
      { expectedValue: false, test: '0xb794f5ea0ba39494ce839613fffba7427957926' },
      { expectedValue: false, test: '0' },
      { expectedValue: false, test: '0,0' },
      { expectedValue: false, test: 'abc' },
      { expectedValue: false, test: 'Abc' },
      { expectedValue: false, test: ' ' },
      { expectedValue: false, test: '' },
      { expectedValue: false, test: '.' },
      { expectedValue: false, test: '-1' },
      { expectedValue: false, test: '0aw0d98a0D(*W)C)(AK' },
    ],
  },
];

describe('regExp', () => {
  for (const { name, regExp, testCases } of regExpTestCases) {
    describe(name, () => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      for (const { expectedValue, test } of testCases) {
        it(`properly test ${test} as ${expectedValue}`, () => {
          expect(regExp.test(test)).toBe(expectedValue);
        });
      }
    });
  }

  describe('special test cases for epochNumberGrabber', () => {
    it('', () => {
      expect(JSON.stringify([...'e1'.matchAll(epochNumberGrabber)])).toBe(
        JSON.stringify([['e1', '1']]),
      );
      expect(JSON.stringify([...'e 1'.matchAll(epochNumberGrabber)])).toBe(
        JSON.stringify([['e 1', '1']]),
      );
      expect(JSON.stringify([...'e1-2'.matchAll(epochNumberGrabber)])).toBe(
        JSON.stringify([['e1-2', '1-2']]),
      );
      expect(JSON.stringify([...'e 1-2'.matchAll(epochNumberGrabber)])).toBe(
        JSON.stringify([['e 1-2', '1-2']]),
      );
      expect(JSON.stringify([...'E1'.matchAll(epochNumberGrabber)])).toBe(
        JSON.stringify([['E1', '1']]),
      );
      expect(JSON.stringify([...'E 1'.matchAll(epochNumberGrabber)])).toBe(
        JSON.stringify([['E 1', '1']]),
      );
      expect(JSON.stringify([...'E1-2'.matchAll(epochNumberGrabber)])).toBe(
        JSON.stringify([['E1-2', '1-2']]),
      );
      expect(JSON.stringify([...'E 1-2'.matchAll(epochNumberGrabber)])).toBe(
        JSON.stringify([['E 1-2', '1-2']]),
      );
      expect(JSON.stringify([...'Epoch1'.matchAll(epochNumberGrabber)])).toBe(
        JSON.stringify([['Epoch1', '1']]),
      );
      expect(JSON.stringify([...'Epoch 1'.matchAll(epochNumberGrabber)])).toBe(
        JSON.stringify([['Epoch 1', '1']]),
      );
      expect(JSON.stringify([...'Epoch1-2'.matchAll(epochNumberGrabber)])).toBe(
        JSON.stringify([['Epoch1-2', '1-2']]),
      );
      expect(JSON.stringify([...'Epoch 1-2'.matchAll(epochNumberGrabber)])).toBe(
        JSON.stringify([['Epoch 1-2', '1-2']]),
      );
      expect(JSON.stringify([...'epoch1'.matchAll(epochNumberGrabber)])).toBe(
        JSON.stringify([['epoch1', '1']]),
      );
      expect(JSON.stringify([...'epoch 1'.matchAll(epochNumberGrabber)])).toBe(
        JSON.stringify([['epoch 1', '1']]),
      );
      expect(JSON.stringify([...'epoch1-2'.matchAll(epochNumberGrabber)])).toBe(
        JSON.stringify([['epoch1-2', '1-2']]),
      );
      expect(JSON.stringify([...'epoch 1-2'.matchAll(epochNumberGrabber)])).toBe(
        JSON.stringify([['epoch 1-2', '1-2']]),
      );
    });
  });
});
