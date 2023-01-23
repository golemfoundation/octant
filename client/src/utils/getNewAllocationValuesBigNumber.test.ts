import { parseUnits } from 'ethers/lib/utils';

import getNewAllocationValuesBigNumber from './getNewAllocationValuesBigNumber';

describe('getNewAllocationValuesBigNumber', () => {
  it('properly maps newAllocationValues to an array with values in BigNumber', () => {
    expect(
      getNewAllocationValuesBigNumber([
        {
          proposalId: 1,
          value: '1',
        },
        {
          proposalId: 2,
          value: '2',
        },
        {
          proposalId: 3,
          value: '3',
        },
        {
          proposalId: 4,
          value: '1809273910283',
        },
      ]),
    ).toEqual([
      {
        proposalId: 1,
        value: parseUnits('1'),
      },
      {
        proposalId: 2,
        value: parseUnits('2'),
      },
      {
        proposalId: 3,
        value: parseUnits('3'),
      },
      {
        proposalId: 4,
        value: parseUnits('1809273910283'),
      },
    ]);
  });
});
