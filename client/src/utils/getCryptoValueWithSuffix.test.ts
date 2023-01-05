import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

import getCryptoValueWithSuffix from './getCryptoValueWithSuffix';

describe('getCryptoValueWithSuffix', () => {
  it('properly returns text when wallet is connected and value is available (ETH)', () => {
    const value = BigNumber.from('42');
    expect(getCryptoValueWithSuffix({ suffix: 'ETH', value })).toBe(`${formatUnits(value)} ETH`);
  });

  it('properly returns text when wallet is connected and value is available (XYZ)', () => {
    const value = BigNumber.from('42');
    expect(getCryptoValueWithSuffix({ suffix: 'XYZ', value })).toBe(`${formatUnits(value)} XYZ`);
  });

  it('properly returns text when wallet is connected and value is not available (XYZ)', () => {
    expect(getCryptoValueWithSuffix({ suffix: 'XYZ' })).toBe(`${formatUnits(0)} XYZ`);
  });
});
