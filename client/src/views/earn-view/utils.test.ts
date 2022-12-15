import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

import { getCurrentEpochStateText } from './utils';

describe('getCurrentEpochStateText', () => {
  it('properly returns text when wallet is not connected and value is not available', () => {
    expect(getCurrentEpochStateText({ isConnected: false, suffix: 'ETH' })).toBe(
      'Please connect your wallet first.',
    );
  });

  it('properly returns text when wallet is not connected and value is available', () => {
    expect(
      getCurrentEpochStateText({ isConnected: false, suffix: 'ETH', value: BigNumber.from('42') }),
    ).toBe('Please connect your wallet first.');
  });

  it('properly returns text when wallet is connected and value is not available', () => {
    expect(getCurrentEpochStateText({ isConnected: true, suffix: 'ETH' })).toBe('Fetching data...');
  });

  it('properly returns text when wallet is connected and value is available (ETH)', () => {
    const value = BigNumber.from('42');
    expect(getCurrentEpochStateText({ isConnected: true, suffix: 'ETH', value })).toBe(
      `${formatUnits(value)} ETH`,
    );
  });

  it('properly returns text when wallet is connected and value is available (XYZ)', () => {
    const value = BigNumber.from('42');
    expect(getCurrentEpochStateText({ isConnected: true, suffix: 'XYZ', value })).toBe(
      `${formatUnits(value)} XYZ`,
    );
  });
});
