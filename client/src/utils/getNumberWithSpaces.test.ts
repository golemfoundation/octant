import getNumberWithSpaces from './getNumberWithSpaces';

const testCases = [
  {
    expectedValue: '0',
    value: '0',
  },
  {
    expectedValue: '1',
    value: '1',
  },
  {
    expectedValue: '10',
    value: '10',
  },
  {
    expectedValue: '100',
    value: '100',
  },
  {
    expectedValue: '1000',
    value: '1000',
  },
  {
    expectedValue: '10\u200a000',
    value: '10000',
  },
  {
    expectedValue: '100\u200a000',
    value: '100000',
  },
  {
    expectedValue: '1\u200a000\u200a000',
    value: '1000000',
  },
  {
    expectedValue: '10\u200a000\u200a000',
    value: '10000000',
  },
  {
    expectedValue: '100\u200a000\u200a000',
    value: '100000000',
  },
  {
    expectedValue: '1\u200a000\u200a000\u200a000',
    value: '1000000000',
  },
  {
    expectedValue: '0.12',
    value: '0.12',
  },
  {
    expectedValue: '1.12',
    value: '1.12',
  },
  {
    expectedValue: '11.12',
    value: '11.12',
  },
  {
    expectedValue: '111.12',
    value: '111.12',
  },
  {
    expectedValue: '1111.12',
    value: '1111.12',
  },
  {
    expectedValue: '11\u200a111.12',
    value: '11111.12',
  },
  {
    expectedValue: '111\u200a111.12',
    value: '111111.12',
  },
  {
    expectedValue: '1\u200a111\u200a111.12',
    value: '1111111.12',
  },
];

describe('getNumberWithSpaces', () => {
  for (const { value, expectedValue } of testCases) {
    it(`returns ${expectedValue} for an argument: ${value}`, () => {
      expect(getNumberWithSpaces(value)).toBe(expectedValue);
    });
  }
});
