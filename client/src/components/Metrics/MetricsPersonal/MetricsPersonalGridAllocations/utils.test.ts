import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import { getReducedUserAllocationsAllEpochs } from './utils';

describe('getReducedUserAllocationsAllEpochs', () => {
  it('properly reduces userAllocationsAllEpochs and squashes the duplicates, summarizing', () => {
    expect(
      getReducedUserAllocationsAllEpochs([
        {
          elements: [
            {
              address: '0x1',
              epoch: 1,
              value: parseUnitsBigInt('0.1'),
            },
            {
              address: '0x2',
              epoch: 1,
              value: parseUnitsBigInt('0.2'),
            },
            {
              address: '0x3',
              epoch: 1,
              value: parseUnitsBigInt('0.3'),
            },
            {
              address: '0x4',
              epoch: 1,
              value: parseUnitsBigInt('0.4'),
            },
          ],
          hasUserAlreadyDoneAllocation: true,
          isManuallyEdited: false,
        },
        {
          elements: [
            {
              address: '0x1',
              epoch: 2,
              value: parseUnitsBigInt('0.3'),
            },
            {
              address: '0x2',
              epoch: 2,
              value: parseUnitsBigInt('0.2'),
            },
            {
              address: '0x3',
              epoch: 2,
              value: parseUnitsBigInt('0.1'),
            },
            {
              address: '0x5',
              epoch: 2,
              value: parseUnitsBigInt('0.5'),
            },
          ],
          hasUserAlreadyDoneAllocation: true,
          isManuallyEdited: false,
        },
      ]),
    ).toEqual([
      {
        address: '0x1',
        epoch: 2,
        value: parseUnitsBigInt('0.4'),
      },
      {
        address: '0x2',
        epoch: 2,
        value: parseUnitsBigInt('0.4'),
      },
      {
        address: '0x3',
        epoch: 2,
        value: parseUnitsBigInt('0.4'),
      },
      {
        address: '0x4',
        epoch: 1,
        value: parseUnitsBigInt('0.4'),
      },
      {
        address: '0x5',
        epoch: 2,
        value: parseUnitsBigInt('0.5'),
      },
    ]);
  });
});
