import React from 'react';

import { AllocationItemWithAllocations } from 'components/Allocation/AllocationItem/types';
import { ProjectIpfsWithRewards } from 'hooks/queries/useProjectsIpfsWithRewards';
import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';
import getSortedElementsByTotalValueOfAllocationsAndAlphabetical from 'utils/getSortedElementsByTotalValueOfAllocationsAndAlphabetical';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

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
  restToDistribute: bigint;
}): AllocationValues {
  if (allocationValues.length === 0) {
    return [];
  }
  const allocationValuesNew = [...allocationValues];
  const allocationValuesSum = allocationValuesNew.reduce((acc, { value }) => {
    return acc + parseUnitsBigInt(value);
  }, BigInt(0));

  if (restToDistribute === 0n) {
    return allocationValues;
  }

  /**
   * Since percentage calculated in getAllocationValuesInitialState is not perfect,
   * chances are allocationValuesSum is lower than restToDistribute.
   */
  if (allocationValuesSum < restToDistribute) {
    const difference = restToDistribute - allocationValuesSum;
    const lastElementValue = parseUnitsBigInt(
      allocationValuesNew[allocationValuesNew.length - 1].value,
    );

    // We don't want to add value to element user chose to set as 0.
    if (lastElementValue > 0n) {
      allocationValuesNew[allocationValuesNew.length - 1].value = formatUnitsBigInt(
        lastElementValue + difference,
      );
    } else {
      // Find first non-zero element.
      const elementIndexToChange = allocationValuesNew.findIndex(
        element => parseUnitsBigInt(element.value) > 0n,
      );
      allocationValuesNew[elementIndexToChange].value = formatUnitsBigInt(
        parseUnitsBigInt(allocationValuesNew[elementIndexToChange].value) + difference,
      );
    }
  }
  /**
   * Since percentage calculated in getAllocationValuesInitialState is not perfect,
   * chances are allocationValuesSum is bigger than restToDistribute.
   */
  if (allocationValuesSum > restToDistribute) {
    const difference = allocationValuesSum - restToDistribute;
    const lastElementValue = parseUnitsBigInt(
      allocationValuesNew[allocationValuesNew.length - 1].value,
    );

    if (lastElementValue >= difference) {
      allocationValuesNew[allocationValuesNew.length - 1].value = formatUnitsBigInt(
        lastElementValue - difference,
      );
    } else {
      const elementIndexToChange = allocationValuesNew.findIndex(
        element => parseUnitsBigInt(element.value) > difference,
      );
      allocationValuesNew[elementIndexToChange].value = formatUnitsBigInt(
        parseUnitsBigInt(allocationValuesNew[elementIndexToChange].value) - difference,
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
  rewardsForProjects,
  shouldReset,
  userAllocationsElements,
}: {
  allocationValues: AllocationValues;
  allocations: string[];
  isManualMode: boolean;
  percentageProportions: PercentageProportions;
  rewardsForProjects: bigint;
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
      restToDistribute: BigInt(0),
    });
  }
  if (!isManualMode) {
    // Case C (see utils.test.ts).
    const allocationValuesNew = allocations.map(allocation => ({
      address: allocation,
      value: formatUnitsBigInt(rewardsForProjects / BigInt(allocations.length)).toLocaleString(
        // @ts-expect-error TS method collision.
        'fullWide',
        {
          useGrouping: false,
        },
      ),
    }));

    return getAllocationValuesWithRewardsSplitted({
      allocationValues: allocationValuesNew,
      restToDistribute: rewardsForProjects,
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
        : formatUnitsBigInt((rewardsForProjects * BigInt(percentageProportion)) / 100n)
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
    restToDistribute: rewardsForProjects,
  });
}

export function getAllocationsWithRewards({
  projectsIpfsWithRewards,
  allocationValues,
  areAllocationsAvailableOrAlreadyDone,
  userAllocationsElements,
}: {
  allocationValues: AllocationValues | undefined;
  areAllocationsAvailableOrAlreadyDone: boolean;
  projectsIpfsWithRewards: ProjectIpfsWithRewards[];
  userAllocationsElements: UserAllocationElementString[] | undefined;
}): AllocationItemWithAllocations[] {
  const isDataDefined =
    projectsIpfsWithRewards &&
    projectsIpfsWithRewards.length > 0 &&
    areAllocationsAvailableOrAlreadyDone;
  let allocationsWithRewards = isDataDefined
    ? allocationValues!.map(allocationValue => {
        const projectIpfsWithRewards = projectsIpfsWithRewards.find(
          ({ address }) => address === allocationValue.address,
        )!;
        const isAllocatedTo = !!userAllocationsElements?.find(
          ({ address }) => address === allocationValue.address,
        );

        return {
          isAllocatedTo,
          ...allocationValue,
          ...projectIpfsWithRewards,
        };
      })
    : [];

  allocationsWithRewards.sort(({ value: valueA }, { value: valueB }) => {
    const valueABigInt = parseUnitsBigInt(valueA || '0');
    const valueBBigInt = parseUnitsBigInt(valueB || '0');
    if (valueABigInt < valueBBigInt) {
      return 1;
    }
    if (valueABigInt > valueBBigInt) {
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
  rewardsForProjects,
  individualReward,
  isManualMode,
  setAddressesWithError,
}: {
  allocationValues: AllocationValues;
  individualReward: bigint | undefined;
  isManualMode: boolean;
  newAllocationValue: AllocationValue;
  rewardsForProjects: bigint;
  setAddressesWithError: React.Dispatch<React.SetStateAction<string[]>>;
}): { allocationValuesArrayNew: AllocationValues; rewardsForProjectsNew: bigint } {
  if (!individualReward) {
    return {
      allocationValuesArrayNew: allocationValues,
      rewardsForProjectsNew: rewardsForProjects,
    };
  }

  const allocationValuesArrayNew = allocationValues.map(element => ({
    ...element,
    value:
      element.address === newAllocationValue.address ? newAllocationValue.value : element.value,
  }));

  const allocationValuesArrayNewSum = allocationValuesArrayNew.reduce(
    (acc, { value }) => acc + parseUnitsBigInt(value || '0'),
    BigInt(0),
  );

  if (allocationValuesArrayNewSum > individualReward) {
    setAddressesWithError(prev => [...prev, newAllocationValue.address]);
    return {
      allocationValuesArrayNew: allocationValues.map(element => ({
        ...element,
        value: element.address === newAllocationValue.address ? '0' : element.value,
      })),
      rewardsForProjectsNew: rewardsForProjects,
    };
  }

  if (isManualMode) {
    return {
      allocationValuesArrayNew,
      rewardsForProjectsNew: allocationValuesArrayNewSum,
    };
  }

  const rewardsForProjectsNew = allocationValuesArrayNewSum === 0n ? BigInt(0) : rewardsForProjects;

  return {
    allocationValuesArrayNew:
      allocationValuesArrayNew.length === 1
        ? allocationValuesArrayNew
        : getAllocationValuesWithRewardsSplitted({
            allocationValues: allocationValuesArrayNew,
            restToDistribute: rewardsForProjectsNew,
          }),
    rewardsForProjectsNew,
  };
}
