import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

import { getCurrentEpochStateText } from './utils';

describe('getCurrentEpochStateText', () => {
  it('properly returns text when wallet is not connected and deposit value is not available', () => {
    expect(getCurrentEpochStateText(false)).toBe('Please connect your wallet first.');
  });

  it('properly returns text when wallet is not connected deposit value is available', () => {
    expect(getCurrentEpochStateText(false, BigNumber.from('42'))).toBe(
      'Please connect your wallet first.',
    );
  });

  it('properly returns text when wallet is connected deposit value is not available', () => {
    expect(getCurrentEpochStateText(true)).toBe('Fetching data about deposit value.');
  });

  it('properly returns text when wallet is connected deposit value is not available', () => {
    const depositValue = BigNumber.from('42');
    expect(getCurrentEpochStateText(true, depositValue)).toBe(`${formatUnits(depositValue)} GLM`);
  });
});
