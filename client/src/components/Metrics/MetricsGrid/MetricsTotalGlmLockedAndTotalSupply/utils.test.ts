import { roundLockedRatio } from './utils';

const testCases = [
  { argument: '0.999', expectedValue: 99.9 },
  { argument: '0.99', expectedValue: 99 },
  { argument: '0.9', expectedValue: 90 },
  { argument: '0.100004666', expectedValue: 10 },
  { argument: '0.005', expectedValue: 0.5 },
  { argument: '0.004', expectedValue: 0.4 },
  { argument: undefined, expectedValue: 0 },
];

describe('roundLockedRatio', () => {
  for (const { expectedValue, argument } of testCases) {
    it(`returns ${expectedValue} for an argument ${argument}`, () => {
      expect(roundLockedRatio(argument)).toBe(expectedValue);
    });
  }
});
