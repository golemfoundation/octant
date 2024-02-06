import { getAllocationsMapped } from './utils';

describe('getAllocationsMapped', () => {
  it('correctly maps allocations', () => {
    expect(
      getAllocationsMapped([
        {
          address: '0x123',
          value: '0',
        },
        {
          address: '0x456',
          value: '1',
        },
        {
          address: '0x789',
          value: '0.5',
        },
        {
          address: '0x101112',
          value: '0.00000000003',
        },
      ]),
    ).toEqual([
      {
        amount: '0',
        proposalAddress: '0x123',
      },
      {
        amount: '1000000000000000000',
        proposalAddress: '0x456',
      },
      {
        amount: '500000000000000000',
        proposalAddress: '0x789',
      },
      {
        amount: '30000000',
        proposalAddress: '0x101112',
      },
    ]);
  });

  it('correctly maps allocations when any value is empty (removed by the user entirely)', () => {
    expect(
      getAllocationsMapped([
        {
          address: '0x123',
          value: '',
        },
        {
          address: '0x456',
          value: '',
        },
        {
          address: '0x789',
          value: '0.5',
        },
        {
          address: '0x101112',
          value: '0.00000000003',
        },
      ]),
    ).toEqual([
      {
        amount: '0',
        proposalAddress: '0x123',
      },
      {
        amount: '0',
        proposalAddress: '0x456',
      },
      {
        amount: '500000000000000000',
        proposalAddress: '0x789',
      },
      {
        amount: '30000000',
        proposalAddress: '0x101112',
      },
    ]);
  });
});
