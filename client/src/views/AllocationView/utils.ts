import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

import { AllocationItemWithAllocations } from 'components/dedicated/AllocationItem/types';
import { ProposalIpfsWithRewards } from 'hooks/queries/useProposalsIpfsWithRewards';
import { UserAllocationElement } from 'hooks/queries/useUserAllocations';

import { AllocationValues } from './types';

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
  const allocationValuesSum = allocationValuesNew.reduce(
    (acc, { value }) => acc.add(value),
    BigNumber.from(0),
  );

  if (restToDistribute.isZero()) {
    return allocationValues;
  }

  if (allocationValuesSum.lt(restToDistribute)) {
    allocationValuesNew[allocationValuesNew.length - 1].value = allocationValuesNew[
      allocationValuesNew.length - 1
    ].value.add(restToDistribute.sub(allocationValuesSum));
  }
  /**
   * Since percentage calcualted in getAllocationValuesInitialState is not perfect,
   * chances are allocationValuesSum is bigger than restToDistribute.
   */
  if (allocationValuesSum.gt(restToDistribute)) {
    const difference = allocationValuesSum.sub(restToDistribute);
    const lastElement = allocationValuesNew[allocationValuesNew.length - 1];

    if (lastElement.value.gte(difference)) {
      allocationValuesNew[allocationValuesNew.length - 1].value =
        allocationValuesNew[allocationValuesNew.length - 1].value.sub(difference);
    } else {
      const elementIndexToChange = allocationValuesNew.findIndex(element =>
        element.value.gt(difference),
      );
      allocationValuesNew[elementIndexToChange].value =
        allocationValuesNew[elementIndexToChange].value.sub(difference);
    }
  }

  return allocationValuesNew;
}

export function getAllocationValuesInitialState({
  allocationValues,
  allocations,
  rewardsForProposals,
  hasZeroRewardsForProposalsBeenReached,
  allocationsEdited,
  shouldSetEqualValues,
  userAllocationsElements,
}: {
  allocationValues: AllocationValues;
  allocations: string[];
  allocationsEdited: string[];
  hasZeroRewardsForProposalsBeenReached: boolean;
  rewardsForProposals: BigNumber;
  shouldSetEqualValues: boolean;
  userAllocationsElements: UserAllocationElement[] | undefined;
}): AllocationValues {
  if (
    shouldSetEqualValues ||
    userAllocationsElements === undefined ||
    (hasZeroRewardsForProposalsBeenReached && allocationsEdited.length === 0)
  ) {
    const allocationValuesNew = allocations.map(allocation => ({
      address: allocation,
      value: rewardsForProposals.div(allocations.length),
    }));

    return getAllocationValuesWithRewardsSplitted({
      allocationValues: allocationValuesNew,
      restToDistribute: rewardsForProposals,
    });
  }

  const userSum = (allocationValues.length > 0 ? allocationValues : userAllocationsElements).reduce(
    (acc, curr) => acc.add(curr.value),
    BigNumber.from(0),
  );

  const allocationValuesNew = allocations.map(allocation => {
    const userAllocationsElement = userAllocationsElements?.find(
      ({ address }) => address === allocation,
    );
    const allocationValue = allocationValues.find(({ address }) => address === allocation);
    /**
     * Current allocationValue is more important that what user set in userAllocations.
     * allocationValues is the current state, so after manual edits.
     */
    const valueUser =
      (!rewardsForProposals.isZero() && allocationValue?.value) ||
      userAllocationsElement?.value ||
      BigNumber.from(0);
    const percentage = !userSum.isZero()
      ? (parseFloat(rewardsForProposals.toString()) * 100) / parseFloat(userSum?.toString())
      : undefined;
    // Value for the project set as valueUser multiplied by percentage.
    const value =
      percentage === undefined
        ? parseFloat(valueUser.toString())
        : (parseFloat(valueUser.toString()) * percentage) / 100;
    return {
      address: allocation,
      value: parseUnits(Math.floor(value).toString(), 'wei'),
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
  userAllocationsElements: UserAllocationElement[] | undefined;
}): AllocationItemWithAllocations[] {
  const isDataDefined =
    proposalsIpfsWithRewards &&
    proposalsIpfsWithRewards.length > 0 &&
    areAllocationsAvailableOrAlreadyDone;
  const allocationsWithRewards = isDataDefined
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

  return allocationsWithRewards.sort(({ name: nameA }, { name: nameB }) => {
    if (!nameA || !nameB) {
      return 0;
    }
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
}

export function getRestToDistribute({
  individualReward,
  rewardsForProposals,
  allocationValues,
  allocationsEdited,
}: {
  allocationValues: AllocationValues;
  allocationsEdited: string[];
  individualReward: BigNumber | undefined;
  rewardsForProposals: BigNumber;
}): BigNumber {
  if (!individualReward || !rewardsForProposals) {
    return BigNumber.from(0);
  }

  const allocationValuesArrayEditedNew = allocationValues.filter(({ address }) =>
    allocationsEdited.includes(address),
  );

  const allocationValuesArrayEditedValueSum = allocationValuesArrayEditedNew.reduce(
    (acc, { value }) => acc.add(value),
    BigNumber.from(0),
  );

  return rewardsForProposals.sub(allocationValuesArrayEditedValueSum);
}

export function getNewAllocationValues({
  allocationValues,
  allocationsEdited,
  proposalAddressToModify,
  newValue,
  rewardsForProposals,
  individualReward,
}: {
  allocationValues: AllocationValues;
  allocationsEdited: string[];
  individualReward: BigNumber | undefined;
  newValue: BigNumber;
  proposalAddressToModify: string;
  rewardsForProposals: BigNumber;
}): AllocationValues {
  if (!individualReward) {
    return allocationValues;
  }

  const allocationValuesArrayNew = allocationValues.map(element => ({
    ...element,
    value: element.address === proposalAddressToModify ? newValue : element.value,
  }));

  const allocationValuesArrayNotEdited = allocationValuesArrayNew.filter(
    ({ address }) => !allocationsEdited.includes(address),
  );
  const allocationValuesArrayEditedNew = allocationValuesArrayNew.filter(({ address }) =>
    allocationsEdited.includes(address),
  );

  const restToDistribute = getRestToDistribute({
    allocationValues: allocationValuesArrayNew,
    allocationsEdited,
    individualReward,
    rewardsForProposals,
  });

  const allocationValuesArrayNotEditedNew = allocationValuesArrayNotEdited.map(element => ({
    ...element,
    value: restToDistribute.div(allocationValuesArrayNotEdited.length),
  }));

  return [
    ...getAllocationValuesWithRewardsSplitted({
      allocationValues: allocationValuesArrayNotEditedNew,
      restToDistribute,
    }),
    ...allocationValuesArrayEditedNew,
  ];
}
