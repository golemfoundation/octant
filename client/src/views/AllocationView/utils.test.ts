/* eslint-disable @typescript-eslint/naming-convention */
import { getAllocationValuesInitialState, getAllocationsWithPositiveValues } from './utils';

describe('getAllocationValuesInitialState', () => {
  it('properly creates allocationValuesInitialState object', () => {
    expect(
      getAllocationValuesInitialState([
        '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91d',
        '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91e',
      ]),
    ).toMatchObject({
      '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91d': undefined,
      '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91e': undefined,
    });
  });
});

describe('getAllocationsWithPositiveValues', () => {
  it('properly finds allocations with values', () => {
    expect(
      getAllocationsWithPositiveValues({
        '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91d': undefined,
        '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91e': undefined,
        '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91f': undefined,
      }),
    ).toEqual([]);
  });

  it('properly finds allocations with values', () => {
    expect(
      getAllocationsWithPositiveValues({
        '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91d': '10',
        '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91e': '0',
        '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91f': undefined,
      }),
    ).toEqual([{ proposalAddress: '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91d', value: '10' }]);
  });

  it('properly finds allocations with values', () => {
    expect(
      getAllocationsWithPositiveValues({
        '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91d': '10',
        '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91e': '5',
        '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91f': undefined,
      }),
    ).toEqual([
      { proposalAddress: '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91d', value: '10' },
      { proposalAddress: '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91e', value: '5' },
    ]);
  });

  it('properly finds allocations with values', () => {
    expect(
      getAllocationsWithPositiveValues({
        '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91d': '10',
        '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91e': '5',
        '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91f': '0',
      }),
    ).toEqual([
      { proposalAddress: '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91d', value: '10' },
      { proposalAddress: '0x5a873cB89BAd323b1acfd998C36aAc6b1a90a91e', value: '5' },
    ]);
  });
});
