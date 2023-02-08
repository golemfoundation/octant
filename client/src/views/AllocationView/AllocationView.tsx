import cx from 'classnames';
import { BigNumber } from 'ethers';
import isEmpty from 'lodash/isEmpty';
import React, { FC, Fragment, useEffect, useState } from 'react';
import { useMetamask } from 'use-metamask';

import AllocationEmptyState from 'components/dedicated/AllocationEmptyState/AllocationEmptyState';
import AllocationInfoBoxes from 'components/dedicated/AllocationInfoBoxes/AllocationInfoBoxes';
import AllocationItem from 'components/dedicated/AllocationItem/AllocationItem';
import AllocationNavigation from 'components/dedicated/AllocationNavigation/AllocationNavigation';
import AllocationSummary from 'components/dedicated/AllocationSummary/AllocationSummary';
import useAllocate from 'hooks/mutations/useAllocate';
import useDepositEffectiveAtCurrentEpoch from 'hooks/queries/useDepositEffectiveAtCurrentEpoch';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposals from 'hooks/queries/useProposals';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useAllocations from 'hooks/subgraph/useAllocations';
import MainLayoutContainer from 'layouts/MainLayout/MainLayoutContainer';
import getNewAllocationValuesBigNumber from 'utils/getNewAllocationValuesBigNumber';
import triggerToast from 'utils/triggerToast';

import styles from './style.module.scss';
import AllocationViewProps, { AllocationValues, CurrentView } from './types';
import {
  getAllocationValuesInitialState,
  getAllocationsWithPositiveValues,
  toastBudgetExceeding,
} from './utils';

const AllocationView: FC<AllocationViewProps> = ({ allocations }) => {
  const {
    metaState: { isConnected },
  } = useMetamask();
  const { proposals } = useProposals();
  const [currentView, setCurrentView] = useState<CurrentView>('edit');
  const [selectedItemId, setSelectedItemId] = useState<null | number>(null);
  const [allocationValues, setAllocationValues] = useState<undefined | AllocationValues>(undefined);
  const {
    data: userAllocations,
    isFetching: isFetchingUserAllocation,
    refetch: refetchUserAllocation,
  } = useUserAllocations({ refetchOnMount: true });
  const { data: individualReward } = useIndividualReward();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: depositEffectiveAtCurrentEpoch } = useDepositEffectiveAtCurrentEpoch();
  const { refetch: refetchAllocations } = useAllocations();
  const { data: matchedProposalRewards, refetch: refetchMatchedProposalRewards } =
    useMatchedProposalRewards();
  const allocateMutation = useAllocate({
    onSuccess: async () => {
      triggerToast({
        title: 'Allocation successful.',
      });
      await refetchMatchedProposalRewards();
      await refetchUserAllocation();
      await refetchAllocations();
      setCurrentView('edit');
      setSelectedItemId(null);
    },
  });

  const allocationsWithPositiveValues = allocationValues
    ? getAllocationsWithPositiveValues(allocationValues)
    : [];

  const onResetAllocationValues = () => {
    const allocationValuesInitValue = getAllocationValuesInitialState(
      allocations!,
      userAllocations,
    );
    setAllocationValues(allocationValuesInitValue);
  };

  useEffect(() => {
    if (proposals.length > 0 && allocations) {
      onResetAllocationValues();
    }
    // eslint-disable-next-line
  }, [allocations, proposals, userAllocations]);

  const onAllocate = () => {
    const allocateMutationArgs =
      allocationsWithPositiveValues.length > 0
        ? allocationsWithPositiveValues
        : [
            {
              proposalId: proposals[0].id.toNumber(),
              value: '0',
            },
          ];
    allocateMutation.mutate(allocateMutationArgs);
  };

  const onChangeAllocationItemValue = (id: number, newValue: string) => {
    if (allocateMutation.isLoading || !individualReward) {
      return;
    }

    // When value === '', we keep it as undefined, for check in AllocationItem.tsx mapping to BigNumber.
    const newValueProcessed = newValue === '' ? undefined : newValue;

    const newAllocationsWithPositiveValues = allocationsWithPositiveValues.map(element => {
      return element.proposalId === id
        ? {
            ...element,
            value: newValue,
          }
        : element;
    });
    if (!newAllocationsWithPositiveValues.find(({ proposalId }) => proposalId === id) && newValue) {
      newAllocationsWithPositiveValues.push({
        proposalId: id,
        value: newValue,
      });
    }

    const newAllocationValuesBigNumber = getNewAllocationValuesBigNumber(
      newAllocationsWithPositiveValues,
    );

    const newAllocationValuesSum = newAllocationValuesBigNumber.reduce(
      (acc, { value }) => acc.add(value),
      BigNumber.from(0),
    );

    if (newAllocationValuesSum.gt(individualReward)) {
      toastBudgetExceeding();
      return;
    }

    setAllocationValues(prevState => ({
      ...prevState,
      [id]: newValueProcessed,
    }));
  };

  const areButtonsDisabled =
    !isConnected || !isDecisionWindowOpen || !!depositEffectiveAtCurrentEpoch?.isZero();
  const areAllocationsAvailable = allocationValues !== undefined && !isEmpty(allocations);
  return (
    <MainLayoutContainer
      isLoading={allocationValues === undefined || (isConnected && isFetchingUserAllocation)}
      navigationBottomSuffix={
        areAllocationsAvailable && (
          <AllocationNavigation
            areButtonsDisabled={areButtonsDisabled}
            currentView={currentView}
            isLoading={allocateMutation.isLoading}
            isSummaryEnabled
            onAllocate={onAllocate}
            onResetAllocationValues={onResetAllocationValues}
            setCurrentView={setCurrentView}
          />
        )
      }
    >
      {currentView === 'edit' ? (
        <Fragment>
          {areAllocationsAvailable ? (
            <div className={styles.boxes}>
              <AllocationInfoBoxes
                classNameBox={styles.box}
                isConnected={isConnected}
                isDecisionWindowOpen={!!isDecisionWindowOpen}
              />
              {allocations!.map((idInAllocation, index) => {
                const allocationItem = proposals.find(
                  ({ id }) => id.toNumber() === idInAllocation,
                )!;
                const proposalMatchedProposalRewards = matchedProposalRewards?.find(
                  ({ id }) => id === allocationItem.id.toNumber(),
                );
                const isSelected = selectedItemId === allocationItem.id.toNumber();
                const value = allocationValues[allocationItem.id.toNumber()];
                return (
                  <AllocationItem
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    className={cx(styles.box, styles.isAllocation, isSelected && styles.isSelected)}
                    isSelected={isSelected}
                    onChange={onChangeAllocationItemValue}
                    onSelectItem={setSelectedItemId}
                    percentage={proposalMatchedProposalRewards?.percentage}
                    totalValueOfAllocations={proposalMatchedProposalRewards?.sum}
                    value={value}
                    {...allocationItem}
                  />
                );
              })}
            </div>
          ) : (
            <AllocationEmptyState />
          )}
          {selectedItemId !== null && (
            <div className={styles.selectedItemOverlay} onClick={() => setSelectedItemId(null)} />
          )}
        </Fragment>
      ) : (
        <AllocationSummary newAllocationValues={allocationsWithPositiveValues} />
      )}
    </MainLayoutContainer>
  );
};

export default AllocationView;
