import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useMetamask } from 'use-metamask';
import React, { FC, Fragment, useEffect, useState } from 'react';
import cx from 'classnames';
import isEmpty from 'lodash/isEmpty';

import { ALLOCATIONS_MAX_NUMBER } from 'constants/allocations';
import { DISCORD_INVITE_LINK } from 'constants/social';
import AllocationInfoBoxes from 'components/dedicated/AllocationInfoBoxes/AllocationInfoBoxes';
import AllocationItem from 'components/dedicated/AllocationItem/AllocationItem';
import AllocationNavigation from 'components/dedicated/AllocationNavigation/AllocationNavigation';
import AllocationSummary from 'components/dedicated/AllocationSummary/AllocationSummary';
import Button from 'components/core/Button/Button';
import MainLayoutContainer from 'layouts/MainLayout/MainLayoutContainer';
import triggerToast from 'utils/triggerToast';
import useAllocate from 'hooks/useAllocate';
import useDepositEffectiveAtCurrentEpoch from 'hooks/useDepositEffectiveAtCurrentEpoch';
import useIndividualReward from 'hooks/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/useIsDecisionWindowOpen';
import useMatchedProposalRewards from 'hooks/useMatchedProposalRewards';
import useProposals from 'hooks/useProposals';
import useUserAllocation from 'hooks/useUserAllocation';

import {
  getAllocationValuesInitialState,
  getAllocationsWithPositiveValues,
  toastBudgetExceeding,
  toastDebouncedOnlyOneItemAllowed,
} from './utils';
import AllocationViewProps, { AllocationValues, CurrentView } from './types';
import styles from './style.module.scss';

const AllocationView: FC<AllocationViewProps> = ({ allocations }) => {
  const {
    metaState: { isConnected },
  } = useMetamask();
  const { proposals } = useProposals();
  const [currentView, setCurrentView] = useState<CurrentView>('edit');
  const [selectedItemId, setSelectedItemId] = useState<null | number>(null);
  const [allocationValues, setAllocationValues] = useState<undefined | AllocationValues>(undefined);
  const {
    data: userAllocation,
    isFetching: isFetchingUserAllocation,
    refetch: refetchUserAllocation,
  } = useUserAllocation({ refetchOnMount: true });
  const { data: individualReward } = useIndividualReward();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: depositEffectiveAtCurrentEpoch } = useDepositEffectiveAtCurrentEpoch();
  const { data: matchedProposalRewards, refetch: refetchMatchedProposalRewards } =
    useMatchedProposalRewards();
  const allocateMutation = useAllocate({
    onSuccess: async () => {
      triggerToast({
        title: 'Allocation successful.',
      });
      await refetchMatchedProposalRewards();
      await refetchUserAllocation();
      setCurrentView('edit');
      setSelectedItemId(null);
    },
  });

  const allocationsWithPositiveValues = allocationValues
    ? getAllocationsWithPositiveValues(allocationValues)
    : {};
  const allocationsWithPositiveValuesKeys = Object.keys(allocationsWithPositiveValues);

  const onResetAllocationValues = () => {
    const allocationValuesInitValue = getAllocationValuesInitialState(allocations!, userAllocation);
    setAllocationValues(allocationValuesInitValue);
  };

  useEffect(() => {
    if (proposals.length > 0 && allocations) {
      onResetAllocationValues();
    }
    // eslint-disable-next-line
  }, [allocations, proposals, userAllocation]);

  const onAllocate = () => {
    const allocateMutationArgs =
      allocationsWithPositiveValuesKeys.length > 0
        ? {
            proposalId: allocationsWithPositiveValuesKeys[0],
            value: allocationValues![allocationsWithPositiveValuesKeys[0]],
          }
        : {
            proposalId: proposals[0].id.toString(),
            value: '0',
          };
    allocateMutation.mutate(allocateMutationArgs);
  };

  const onChangeAllocationItemValue = (id: number, newValue: string) => {
    // When value === '', we keep it as undefined, for check in AllocationItem.tsx mapping to BigNumber.
    const newValueProcessed = newValue === '' ? undefined : newValue;
    let newValueBigNumber = parseUnits(newValueProcessed || '0');
    if (allocateMutation.isLoading || !individualReward) {
      return;
    }
    if (
      allocationsWithPositiveValuesKeys.length >= ALLOCATIONS_MAX_NUMBER &&
      !allocationsWithPositiveValuesKeys.includes(id.toString())
    ) {
      toastDebouncedOnlyOneItemAllowed();
      return;
    }
    if (newValueBigNumber.lt(0)) {
      newValueBigNumber = BigNumber.from(0);
    }
    if (newValueBigNumber.gt(individualReward)) {
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
            isSummaryEnabled={allocationsWithPositiveValuesKeys.length > 0}
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
                    className={cx(styles.box, isSelected && styles.isSelected)}
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
            <div className={styles.emptyState}>
              You haven’t made any allocations yet. Need a bit of help getting started?
              <Button
                className={styles.buttonDiscord}
                href={DISCORD_INVITE_LINK}
                label="Join us on Discord"
                variant="link"
              />
            </div>
          )}
          {selectedItemId !== null && (
            <div className={styles.selectedItemOverlay} onClick={() => setSelectedItemId(null)} />
          )}
        </Fragment>
      ) : (
        <AllocationSummary
          newAllocationValue={allocationValues![allocationsWithPositiveValuesKeys[0]]}
        />
      )}
    </MainLayoutContainer>
  );
};

export default AllocationView;
