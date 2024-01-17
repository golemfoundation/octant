import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import React from 'react';

import { AllocationItemWithAllocations } from 'components/Allocation/AllocationItem/types';
import { ProposalIpfsWithRewards } from 'hooks/queries/useProposalsIpfsWithRewards';
import getSortedElementsByTotalValueOfAllocationsAndAlphabetical from 'utils/getSortedElementsByTotalValueOfAllocationsAndAlphabetical';

import {
  AllocationValue,
  AllocationValues,
  PercentageProportions,
  UserAllocationElementString,
} from './types';

export function getAllocationValuesWithRewardsSplitted({
  allocationValues,
  restToDistribute,
}: {
  allocationValues: AllocationValues;
  restToDistribute: BigNumber;
}): AllocationValues {
  if (allocationValues.length === 0) {
    return [];
  }
  const allocationValuesNew = [...allocationValues];
  const allocationValuesSum = allocationValuesNew.reduce((acc, { value }) => {
    return acc.add(parseUnits(value));
  }, BigNumber.from(0));

  if (restToDistribute.isZero()) {
    return allocationValues;
  }

  /**
   * Since percentage calculated in getAllocationValuesInitialState is not perfect,
   * chances are allocationValuesSum is lower than restToDistribute.
   */
  if (allocationValuesSum.lt(restToDistribute)) {
    const difference = restToDistribute.sub(allocationValuesSum);
    const lastElementValue = parseUnits(allocationValuesNew[allocationValuesNew.length - 1].value);

    // We don't want to add value to element user chose to set as 0.
    if (!lastElementValue.isZero()) {
      allocationValuesNew[allocationValuesNew.length - 1].value = formatUnits(
        lastElementValue.add(difference),
      );
    } else {
      // Find first non-zero element.
      const elementIndexToChange = allocationValuesNew.findIndex(
        element => !parseUnits(element.value).isZero(),
      );
      allocationValuesNew[elementIndexToChange].value = formatUnits(
        parseUnits(allocationValuesNew[elementIndexToChange].value).add(difference),
      );
    }
  }
  /**
   * Since percentage calculated in getAllocationValuesInitialState is not perfect,
   * chances are allocationValuesSum is bigger than restToDistribute.
   */
  if (allocationValuesSum.gt(restToDistribute)) {
    const difference = allocationValuesSum.sub(restToDistribute);
    const lastElementValue = parseUnits(allocationValuesNew[allocationValuesNew.length - 1].value);

    if (lastElementValue.gte(difference)) {
      allocationValuesNew[allocationValuesNew.length - 1].value = formatUnits(
        lastElementValue.sub(difference),
      );
    } else {
      const elementIndexToChange = allocationValuesNew.findIndex(element =>
        parseUnits(element.value).gt(difference),
      );
      allocationValuesNew[elementIndexToChange].value = formatUnits(
        parseUnits(allocationValuesNew[elementIndexToChange].value).sub(difference),
      );
    }
  }

  return allocationValuesNew;
}

export function getAllocationValuesInitialState({
  allocationValues,
  allocations,
  isManualMode,
  percentageProportions,
  rewardsForProposals,
  shouldReset,
  userAllocationsElements,
}: {
  allocationValues: AllocationValues;
  allocations: string[];
  isManualMode: boolean;
  percentageProportions: PercentageProportions;
  rewardsForProposals: BigNumber;
  shouldReset: boolean;
  userAllocationsElements: UserAllocationElementString[];
}): AllocationValues {
  if (shouldReset) {
    const allocationValuesNew = allocations.map(allocation => {
      // Case A (see utils.test.ts).
      if (userAllocationsElements.length > 0) {
        const userAllocationValue = userAllocationsElements.find(
          element => element.address === allocation,
        )?.value;
        const userAllocationValueFinal = userAllocationValue || '0';
        return {
          address: allocation,
          // @ts-expect-error TS method collision.
          value: userAllocationValueFinal.toLocaleString('fullWide', { useGrouping: false }),
        };
      }
      // Case B (see utils.test.ts).
      return {
        address: allocation,
        // @ts-expect-error TS method collision.
        value: '0'.toLocaleString('fullWide', { useGrouping: false }),
      };
    });

    return getAllocationValuesWithRewardsSplitted({
      allocationValues: allocationValuesNew,
      restToDistribute: BigNumber.from(0),
    });
  }
  if (userAllocationsElements.length === 0 && !isManualMode) {
    // Case C (see utils.test.ts).
    const allocationValuesNew = allocations.map(allocation => ({
      address: allocation,
      // @ts-expect-error TS method collision.
      value: formatUnits(rewardsForProposals.div(allocations.length)).toLocaleString('fullWide', {
        useGrouping: false,
      }),
    }));

    return getAllocationValuesWithRewardsSplitted({
      allocationValues: allocationValuesNew,
      restToDistribute: rewardsForProposals,
    });
  }
  // Case D (see utils.test.ts).

  const allocationValuesNew = allocations.map(allocation => {
    const percentageProportion = percentageProportions[allocation];
    const allocationValue = allocationValues.find(element => element.address === allocation)?.value;
    const userAllocationValue = userAllocationsElements.find(
      element => element.address === allocation,
    )?.value;
    const userValue = allocationValue || userAllocationValue || '0';
    // Value for the project set as valueUser multiplied by percentage.
    const value = (
      percentageProportion === undefined
        ? userValue
        : formatUnits(rewardsForProposals.mul(percentageProportion).div(100))
    )
      // @ts-expect-error TS method collision.
      .toLocaleString('fullWide', { useGrouping: false });
    return {
      address: allocation,
      value,
    };
  });

  return getAllocationValuesWithRewardsSplitted({
    allocationValues: allocationValuesNew,
    restToDistribute: rewardsForProposals,
  });
}

export function getAllocationsWithRewards({
  proposalsIpfsWithRewards,
  allocationValues,
  areAllocationsAvailableOrAlreadyDone,
  userAllocationsElements,
}: {
  allocationValues: AllocationValues | undefined;
  areAllocationsAvailableOrAlreadyDone: boolean;
  proposalsIpfsWithRewards: ProposalIpfsWithRewards[];
  userAllocationsElements: UserAllocationElementString[] | undefined;
}): AllocationItemWithAllocations[] {
  const isDataDefined =
    proposalsIpfsWithRewards &&
    proposalsIpfsWithRewards.length > 0 &&
    areAllocationsAvailableOrAlreadyDone;
  let allocationsWithRewards = isDataDefined
    ? allocationValues!.map(allocationValue => {
        const proposal = proposalsIpfsWithRewards.find(
          ({ address }) => address === allocationValue.address,
        )!;
        const isAllocatedTo = !!userAllocationsElements?.find(
          ({ address }) => address === allocationValue.address,
        );

        return {
          isAllocatedTo,
          ...allocationValue,
          ...proposal,
        };
      })
    : [];

  allocationsWithRewards.sort(({ value: valueA }, { value: valueB }) => {
    const valueABigNumber = parseUnits(valueA || '0');
    const valueBBigNumber = parseUnits(valueB || '0');
    if (valueABigNumber.lt(valueBBigNumber)) {
      return 1;
    }
    if (valueABigNumber.gt(valueBBigNumber)) {
      return -1;
    }
    return 0;
  });

  allocationsWithRewards = getSortedElementsByTotalValueOfAllocationsAndAlphabetical(
    allocationsWithRewards as AllocationItemWithAllocations[],
  ) as AllocationItemWithAllocations[];

  return allocationsWithRewards;
}

export function getAllocationValuesAfterManualChange({
  newAllocationValue,
  allocationValues,
  rewardsForProposals,
  individualReward,
  isManualMode,
  setAddressesWithError,
}: {
  allocationValues: AllocationValues;
  individualReward: BigNumber | undefined;
  isManualMode: boolean;
  newAllocationValue: AllocationValue;
  rewardsForProposals: BigNumber;
  setAddressesWithError: React.Dispatch<React.SetStateAction<string[]>>;
}): { allocationValuesArrayNew: AllocationValues; rewardsForProposalsNew: BigNumber } {
  if (!individualReward) {
    return {
      allocationValuesArrayNew: allocationValues,
      rewardsForProposalsNew: rewardsForProposals,
    };
  }

  const allocationValuesArrayNew = allocationValues.map(element => ({
    ...element,
    value:
      element.address === newAllocationValue.address ? newAllocationValue.value : element.value,
  }));

  const allocationValuesArrayNewSum = allocationValuesArrayNew.reduce(
    (acc, { value }) => acc.add(parseUnits(value || '0')),
    BigNumber.from(0),
  );

  if (allocationValuesArrayNewSum.gt(individualReward)) {
    setAddressesWithError(prev => [...prev, newAllocationValue.address]);
    return {
      allocationValuesArrayNew: allocationValues.map(element => ({
        ...element,
        value: element.address === newAllocationValue.address ? '0' : element.value,
      })),
      rewardsForProposalsNew: rewardsForProposals,
    };
  }

  if (isManualMode) {
    return {
      allocationValuesArrayNew,
      rewardsForProposalsNew: allocationValuesArrayNewSum,
    };
  }

  return {
    allocationValuesArrayNew: getAllocationValuesWithRewardsSplitted({
      allocationValues: allocationValuesArrayNew,
      restToDistribute: rewardsForProposals,
    }),
    rewardsForProposalsNew: rewardsForProposals,
  };
}
