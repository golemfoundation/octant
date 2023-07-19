import getIsPreLaunch from './getIsPreLaunch';

const testCases = [
  {
    argument: undefined,
    description: 'correctly returns false when currentEpoch is undefined',
    expectedValue: false,
  },
  {
    argument: 2,
    description: 'correctly returns false when currentEpoch is 2',
    expectedValue: false,
  },
  {
    argument: 0,
    description: 'correctly returns true when currentEpoch is 0',
    expectedValue: true,
  },
];

describe('getIsPreLaunch', () => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  for (const { description, argument, expectedValue } of testCases) {
    it(description, () => {
      expect(getIsPreLaunch(argument)).toBe(expectedValue);
    });
  }
});
