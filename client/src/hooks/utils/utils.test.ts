import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

import { getAllocationsMapped } from './utils';

describe('getAllocationsMapped', () => {
  it('correctly maps allocations', () => {
    expect(
      getAllocationsMapped([
        {
          address: '0x123',
          value: BigNumber.from(0),
        },
        {
          address: '0x456',
          value: BigNumber.from(100),
        },
        {
          address: '0x789',
          value: BigNumber.from(999),
        },
        {
          address: '0x101112',
          value: parseUnits('1', 'ether'),
        },
      ]),
    ).toEqual([
      {
        amount: '0',
        proposalAddress: '0x123',
      },
      {
        amount: '100',
        proposalAddress: '0x456',
      },
      {
        amount: '999',
        proposalAddress: '0x789',
      },
      {
        amount: '1000000000000000000',
        proposalAddress: '0x101112',
      },
    ]);
  });
});
