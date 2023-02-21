import { parseUnits } from 'ethers/lib/utils';

import getNewAllocationValuesBigNumber from './getNewAllocationValuesBigNumber';

describe('getNewAllocationValuesBigNumber', () => {
  it('properly maps newAllocationValues to an array with values in BigNumber', () => {
    expect(
      getNewAllocationValuesBigNumber([
        {
          proposalAddress: '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91d',
          value: '1',
        },
        {
          proposalAddress: '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91e',
          value: '2',
        },
        {
          proposalAddress: '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91f',
          value: '3',
        },
        {
          proposalAddress: '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91g',
          value: '1809273910283',
        },
      ]),
    ).toEqual([
      {
        proposalAddress: '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91d',
        value: parseUnits('1'),
      },
      {
        proposalAddress: '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91e',
        value: parseUnits('2'),
      },
      {
        proposalAddress: '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91f',
        value: parseUnits('3'),
      },
      {
        proposalAddress: '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91g',
        value: parseUnits('1809273910283'),
      },
    ]);
  });
});
