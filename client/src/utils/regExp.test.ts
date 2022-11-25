import { floatNumberWithUpTo18DecimalPlaces } from './regExp';

const regExpTestCases = [
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
});
