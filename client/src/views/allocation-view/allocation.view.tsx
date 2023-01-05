import { useMetamask } from 'use-metamask';
import React, { FC, Fragment, useEffect, useState } from 'react';
import cx from 'classnames';
import isEmpty from 'lodash/isEmpty';

import { ALLOCATIONS_MAX_NUMBER } from 'constants/allocations';
import { DISCORD_INVITE_LINK } from 'constants/social';
import AllocationInfoBoxes from 'components/dedicated/allocation-info-boxes/allocation-info-boxes.component';
import AllocationItem from 'components/dedicated/allocation-item/allocation-item.component';
import AllocationNavigation from 'components/dedicated/allocation-navigation/allocation-navigation.component';
import AllocationSummary from 'components/dedicated/allocation-summary/allocation-summary.component';
import Button from 'components/core/button/button.component';
import MainLayout from 'layouts/main-layout/main.layout.container';
import triggerToast from 'utils/triggerToast';
import useDepositEffectiveAtCurrentEpoch from 'hooks/useDepositEffectiveAtCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/useIsDecisionWindowOpen';
import useMatchedProposalRewards from 'hooks/useMatchedProposalRewards';
import useProposals from 'hooks/useProposals';
import useUserVote from 'hooks/useUserVote';
import useVote from 'hooks/useVote';

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
    data: userVote,
    isFetching: isFetchingUserVote,
    refetch: refetchUserVote,
  } = useUserVote({ refetchOnMount: true });
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: depositEffectiveAtCurrentEpoch } = useDepositEffectiveAtCurrentEpoch();
  const { data: matchedProposalRewards, refetch: refetchMatchedProposalRewards } =
    useMatchedProposalRewards();
  const voteMutation = useVote({
    onSuccess: () => {
      triggerToast({
        title: 'Allocation successful.',
      });
      refetchMatchedProposalRewards();
      refetchUserVote();
    },
  });

  const allocationsWithPositiveValues = allocationValues
    ? getAllocationsWithPositiveValues(allocationValues)
    : {};
  const allocationsWithPositiveValuesKeys = Object.keys(allocationsWithPositiveValues);

  const onResetAllocationValues = () => {
    const allocationValuesInitValue = getAllocationValuesInitialState(allocations!, userVote);
    setAllocationValues(allocationValuesInitValue);
  };

  useEffect(() => {
    if (proposals.length > 0 && allocations) {
      onResetAllocationValues();
    }
    // eslint-disable-next-line
  }, [allocations, proposals, userVote]);

  const onVote = () => {
    const voteMutationArgs =
      allocationsWithPositiveValuesKeys.length > 0
        ? {
            proposalId: allocationsWithPositiveValuesKeys[0],
            value: allocationValues![allocationsWithPositiveValuesKeys[0]],
          }
        : {
            proposalId: proposals[0].id.toString(),
            value: '0',
          };
    voteMutation.mutate(voteMutationArgs);
  };

  const changeAllocationItemValue = (id: number, value: number) => {
    if (voteMutation.isLoading) {
      return;
    }
    if (
      allocationsWithPositiveValuesKeys.length >= ALLOCATIONS_MAX_NUMBER &&
      !allocationsWithPositiveValuesKeys.includes(id.toString())
    ) {
      toastDebouncedOnlyOneItemAllowed();
      return;
    }
    if (value > 100) {
      toastBudgetExceeding();
      return;
    }
    setAllocationValues(prevState => ({
      ...prevState,
      [id]: value,
    }));
  };

  const areButtonsDisabled =
    !isConnected || !isDecisionWindowOpen || !!depositEffectiveAtCurrentEpoch?.isZero();
  const areAllocationsAvailable = allocationValues !== undefined && !isEmpty(allocations);
  return (
    <MainLayout
      isLoading={allocationValues === undefined || (isConnected && isFetchingUserVote)}
      navigationBottomSuffix={
        areAllocationsAvailable && (
          <AllocationNavigation
            areButtonsDisabled={areButtonsDisabled}
            currentView={currentView}
            isLoading={voteMutation.isLoading}
            isSummaryEnabled={allocationsWithPositiveValuesKeys.length > 0}
            onResetAllocationValues={onResetAllocationValues}
            onVote={onVote}
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
                    onChange={changeAllocationItemValue}
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
          newAllocationPercentage={allocationValues![allocationsWithPositiveValuesKeys[0]]}
        />
      )}
    </MainLayout>
  );
};

export default AllocationView;
