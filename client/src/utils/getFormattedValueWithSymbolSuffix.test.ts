import getFormattedValueWithSymbolSuffix, {
  FormattedValueWithSymbolSuffixInput,
} from './getFormattedValueWithSymbolSuffix';

const testCases: { expectedValue: string; params: FormattedValueWithSymbolSuffixInput }[] = [
  // format: 'thousands'
  { expectedValue: '1', params: { format: 'thousands', precision: 0, value: 1.01 } },
  { expectedValue: '1', params: { format: 'thousands', precision: 1, value: 1.01 } },
  { expectedValue: '1.01', params: { format: 'thousands', precision: 2, value: 1.01 } },
  { expectedValue: '1.01', params: { format: 'thousands', precision: 3, value: 1.01 } },
  { expectedValue: '10', params: { format: 'thousands', precision: 0, value: 10.01 } },
  { expectedValue: '10', params: { format: 'thousands', precision: 1, value: 10.01 } },
  { expectedValue: '10.01', params: { format: 'thousands', precision: 2, value: 10.01 } },
  { expectedValue: '10.01', params: { format: 'thousands', precision: 3, value: 10.01 } },
  { expectedValue: '100', params: { format: 'thousands', precision: 0, value: 100.01 } },
  { expectedValue: '100', params: { format: 'thousands', precision: 1, value: 100.01 } },
  { expectedValue: '100.01', params: { format: 'thousands', precision: 2, value: 100.01 } },
  { expectedValue: '100.01', params: { format: 'thousands', precision: 3, value: 100.01 } },
  { expectedValue: '1K', params: { format: 'thousands', precision: 0, value: 1001 } },
  { expectedValue: '1K', params: { format: 'thousands', precision: 1, value: 1001 } },
  { expectedValue: '1K', params: { format: 'thousands', precision: 2, value: 1001 } },
  { expectedValue: '1.001K', params: { format: 'thousands', precision: 3, value: 1001 } },
  { expectedValue: '10K', params: { format: 'thousands', precision: 0, value: 10001 } },
  { expectedValue: '10K', params: { format: 'thousands', precision: 1, value: 10001 } },
  { expectedValue: '10K', params: { format: 'thousands', precision: 2, value: 10001 } },
  { expectedValue: '10.001K', params: { format: 'thousands', precision: 3, value: 10001 } },
  { expectedValue: '100K', params: { format: 'thousands', precision: 0, value: 100001 } },
  { expectedValue: '100K', params: { format: 'thousands', precision: 1, value: 100001 } },
  { expectedValue: '100K', params: { format: 'thousands', precision: 2, value: 100001 } },
  { expectedValue: '100.001K', params: { format: 'thousands', precision: 3, value: 100001 } },
  { expectedValue: '1000K', params: { format: 'thousands', precision: 0, value: 1000001 } },
  { expectedValue: '1000K', params: { format: 'thousands', precision: 1, value: 1000001 } },
  { expectedValue: '1000K', params: { format: 'thousands', precision: 2, value: 1000001 } },
  { expectedValue: '1000.001K', params: { format: 'thousands', precision: 3, value: 1000001 } },
  // format: 'millions'
  { expectedValue: '1001', params: { format: 'millions', precision: 0, value: 1001 } },
  { expectedValue: '1001', params: { format: 'millions', precision: 1, value: 1001 } },
  { expectedValue: '1001', params: { format: 'millions', precision: 2, value: 1001 } },
  { expectedValue: '1001', params: { format: 'millions', precision: 3, value: 1001 } },
  { expectedValue: '10001', params: { format: 'millions', precision: 0, value: 10001 } },
  { expectedValue: '10001', params: { format: 'millions', precision: 1, value: 10001 } },
  { expectedValue: '10001', params: { format: 'millions', precision: 2, value: 10001 } },
  { expectedValue: '10001', params: { format: 'millions', precision: 3, value: 10001 } },
  { expectedValue: '100001', params: { format: 'millions', precision: 0, value: 100001 } },
  { expectedValue: '100001', params: { format: 'millions', precision: 1, value: 100001 } },
  { expectedValue: '100001', params: { format: 'millions', precision: 2, value: 100001 } },
  { expectedValue: '100001', params: { format: 'millions', precision: 3, value: 100001 } },
  { expectedValue: '1M', params: { format: 'millions', precision: 0, value: 1001000 } },
  { expectedValue: '1M', params: { format: 'millions', precision: 1, value: 1001000 } },
  { expectedValue: '1M', params: { format: 'millions', precision: 2, value: 1001000 } },
  { expectedValue: '1.001M', params: { format: 'millions', precision: 3, value: 1001000 } },
  // format: 'thousandsAndMillions'
  { expectedValue: '1K', params: { format: 'thousandsAndMillions', precision: 0, value: 1001 } },
  { expectedValue: '1K', params: { format: 'thousandsAndMillions', precision: 1, value: 1001 } },
  { expectedValue: '1K', params: { format: 'thousandsAndMillions', precision: 2, value: 1001 } },
  {
    expectedValue: '1.001K',
    params: { format: 'thousandsAndMillions', precision: 3, value: 1001 },
  },
  { expectedValue: '10K', params: { format: 'thousandsAndMillions', precision: 0, value: 10001 } },
  { expectedValue: '10K', params: { format: 'thousandsAndMillions', precision: 1, value: 10001 } },
  { expectedValue: '10K', params: { format: 'thousandsAndMillions', precision: 2, value: 10001 } },
  {
    expectedValue: '10.001K',
    params: { format: 'thousandsAndMillions', precision: 3, value: 10001 },
  },
  {
    expectedValue: '100K',
    params: { format: 'thousandsAndMillions', precision: 0, value: 100001 },
  },
  {
    expectedValue: '100K',
    params: { format: 'thousandsAndMillions', precision: 1, value: 100001 },
  },
  {
    expectedValue: '100K',
    params: { format: 'thousandsAndMillions', precision: 2, value: 100001 },
  },
  {
    expectedValue: '100.001K',
    params: { format: 'thousandsAndMillions', precision: 3, value: 100001 },
  },
  { expectedValue: '1M', params: { format: 'thousandsAndMillions', precision: 0, value: 1001000 } },
  { expectedValue: '1M', params: { format: 'thousandsAndMillions', precision: 1, value: 1001000 } },
  { expectedValue: '1M', params: { format: 'thousandsAndMillions', precision: 2, value: 1001000 } },
  {
    expectedValue: '1.001M',
    params: { format: 'thousandsAndMillions', precision: 3, value: 1001000 },
  },
];

describe('getFormattedValueWithSymbolSuffix', () => {
  for (const { params, expectedValue } of testCases) {
    it(`returns ${expectedValue} for params ${params}`, () => {
      expect(getFormattedValueWithSymbolSuffix(params)).toBe(expectedValue);
    });
  }
});
