import { floatNumberWithUpTo18DecimalPlaces } from './regExp';

const regExpTestCases = [
  {
    name: 'floatNumberWithUpTo18DecimalPlaces',
    regExp: floatNumberWithUpTo18DecimalPlaces,
    testCases: [
      { hasValue: true, test: '1' },
      { hasValue: true, test: '1.0' },
      { hasValue: true, test: '1.000' },
      { hasValue: true, test: '1.0000' },
      { hasValue: true, test: '1.00000' },
      { hasValue: true, test: '1.000000' },
      { hasValue: true, test: '1.0000000' },
      { hasValue: true, test: '1.00000000' },
      { hasValue: true, test: '1.000000000' },
      { hasValue: true, test: '1.0000000000' },
      { hasValue: true, test: '1.00000000000' },
      { hasValue: true, test: '1.000000000000' },
      { hasValue: true, test: '1.0000000000000' },
      { hasValue: true, test: '1.00000000000000' },
      { hasValue: true, test: '1.000000000000000' },
      { hasValue: true, test: '1.000000000000000' },
      { hasValue: true, test: '1.0000000000000000' },
      { hasValue: true, test: '1.000000000000000000' }, // 18 decimal places
      { hasValue: false, test: '1.0000000000000000000' }, // 19 decimal places
      { hasValue: true, test: '1.' },
      { hasValue: false, test: '.000000000000000000' },
      { hasValue: false, test: '1.a' },
      { hasValue: false, test: '1.-' },
      { hasValue: false, test: 'abc' },
      { hasValue: false, test: '+123123123' },
      { hasValue: false, test: '+12312awdawda' },
      { hasValue: false, test: '+adawdawd' },
      { hasValue: false, test: 'adawdawd' },
      { hasValue: false, test: 'test' },
      { hasValue: false, test: '+673829123' },
      { hasValue: false, test: '/13123123123123' },
      { hasValue: true, test: '999999999' },
    ],
  },
];

describe('regExp', () => {
  for (const { name, regExp, testCases } of regExpTestCases) {
    describe(name, () => {
      for (const { hasValue, test } of testCases) {
        it(`properly test ${test} as ${hasValue}`, () => {
          expect(regExp.test(test)).toBe(hasValue);
        });
      }
    });
  }
});
