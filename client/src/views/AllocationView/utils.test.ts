/* eslint-disable @typescript-eslint/naming-convention */
import { BigNumber } from 'ethers';

import { AllocationValues } from './types';
import {
  getRestToDistribute,
  getNewAllocationValues,
  getAllocationValuesWithRewardsSplitted,
} from './utils';

describe('getAllocationValuesWithRewardsSplitted', () => {
  it('properly distributes the difference between restToDistribute and sum of values among projects ', () => {
    expect(
      getAllocationValuesWithRewardsSplitted({
        allocationValues: [
          { address: '0xabc', value: BigNumber.from(100) },
          { address: '0xdef', value: BigNumber.from(200) },
          { address: '0x123', value: BigNumber.from(150) },
        ],
        restToDistribute: BigNumber.from(500),
      }),
    ).toEqual([
      { address: '0xabc', value: BigNumber.from(100) },
      { address: '0xdef', value: BigNumber.from(200) },
      { address: '0x123', value: BigNumber.from(200) },
    ]);

    expect(
      getAllocationValuesWithRewardsSplitted({
        allocationValues: [
          { address: '0xabc', value: BigNumber.from(100) },
          { address: '0xdef', value: BigNumber.from(200) },
          { address: '0x123', value: BigNumber.from(150) },
        ],
        restToDistribute: BigNumber.from(700),
      }),
    ).toEqual([
      { address: '0xabc', value: BigNumber.from(100) },
      { address: '0xdef', value: BigNumber.from(200) },
      { address: '0x123', value: BigNumber.from(400) },
    ]);
  });

  it('returns empty array when given empty array', () => {
    expect(
      getAllocationValuesWithRewardsSplitted({
        allocationValues: [],
        restToDistribute: BigNumber.from(500),
      }),
    ).toEqual([]);
  });
});

describe('getRestToDistribute', () => {
  const propsCommon = {
    allocationValues: [
      { address: '0xabc', value: BigNumber.from(100) },
      { address: '0xdef', value: BigNumber.from(200) },
      { address: '0x123', value: BigNumber.from(250) },
    ],
    allocationsEdited: ['0xabc', '0xdef'],
    individualReward: BigNumber.from(500),
    rewardsForProposals: BigNumber.from(1000),
  };
  it('should return the correct rest to distribute when allocation values and individual reward are provided', () => {
    const restToDistribute = getRestToDistribute(propsCommon);

    const expectedRestToDistribute = BigNumber.from(700); // 1000 - (100 + 200)

    expect(restToDistribute).toEqual(expectedRestToDistribute);
  });

  it('should return zero when individualReward', () => {
    const restToDistribute = getRestToDistribute({
      ...propsCommon,
      individualReward: undefined,
    });

    expect(restToDistribute).toEqual(BigNumber.from(0));
  });
});

describe('getNewAllocationValues', () => {
  const propsCommon = {
    allocationValues: [
      { address: '0x123', value: BigNumber.from(150) },
      { address: '0xabc', value: BigNumber.from(100) },
      { address: '0xdef', value: BigNumber.from(200) },
    ],
    allocationsEdited: ['0xdef', '0xabc'],
    individualReward: BigNumber.from(5000),
    newValue: BigNumber.from(500),
    proposalAddressToModify: '0xabc',
    rewardsForProposals: BigNumber.from(1000),
  };

  it('should return the correct updated allocation values', () => {
    const newAllocationValues = getNewAllocationValues(propsCommon);

    const expectedAllocationValues: AllocationValues = [
      { address: '0x123', value: BigNumber.from(300) },
      { address: '0xabc', value: BigNumber.from(500) },
      { address: '0xdef', value: BigNumber.from(200) },
    ];

    expect(newAllocationValues).toEqual(expectedAllocationValues);
  });

  it('should return the original allocation values when individual reward is not provided', () => {
    const newAllocationValues = getNewAllocationValues({
      ...propsCommon,
      individualReward: undefined,
    });

    expect(newAllocationValues).toEqual(propsCommon.allocationValues);
  });
});
