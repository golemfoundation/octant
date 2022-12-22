import { useMetamask } from 'use-metamask';
import React, { ReactElement, useEffect, useState } from 'react';
import cx from 'classnames';

import { ALLOCATIONS_MAX_NUMBER } from 'constants/allocations';
import AllocationItem from 'components/dedicated/allocation-item/allocation-item.component';
import BoxRounded from 'components/core/box-rounded/box-rounded.component';
import Button from 'components/core/button/button.component';
import Loader from 'components/core/loader/loader.component';
import MainLayout from 'layouts/main-layout/main.layout';
import triggerToast from 'utils/triggerToast';
import useIdsInAllocation from 'hooks/useIdsInAllocation';
import useIsDecisionWindowOpen from 'hooks/useIsDecisionWindowOpen';
import useProposals from 'hooks/useProposals';
import useUserVote from 'hooks/useUserVote';
import useVote from 'hooks/useVote';

import { AllocationValues } from './types';
import {
  getAllocationValuesInitialState,
  getAllocationsWithPositiveValues,
  toastBudgetExceeding,
  toastDebouncedOnlyOneItemAllowed,
} from './utils';
import styles from './style.module.scss';

const AllocationView = (): ReactElement => {
  const {
    metaState: { isConnected },
  } = useMetamask();
  const [proposals] = useProposals();
  const [idsInAllocation] = useIdsInAllocation(proposals);
  const [selectedItemId, setSelectedItemId] = useState<null | number>(null);
  const [allocationValues, setAllocationValues] = useState<AllocationValues>({});
  const [isRenderingReady, setIsRenderingReady] = useState<boolean>(false);
  const { data: userVote, isFetching: isFetchingUserVote } = useUserVote();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const voteMutation = useVote({
    onSuccess: () => {
      triggerToast({
        title: 'Allocation successful.',
      });
    },
  });

  const onResetAllocationValues = () => {
    const allocationValuesInitValue = getAllocationValuesInitialState(idsInAllocation!, userVote);
    setAllocationValues(allocationValuesInitValue);
    setIsRenderingReady(true);
  };

  const onVote = async () => {
    const allocationsWithPositiveValues = getAllocationsWithPositiveValues(allocationValues!);
    const allocationsWithPositiveValuesKeys = Object.keys(allocationsWithPositiveValues);

    if (allocationsWithPositiveValuesKeys.length > 0) {
      const proposalId = allocationsWithPositiveValuesKeys[0];
      voteMutation.mutate({
        proposalId,
        value: allocationValues[proposalId],
      });
      return;
    }
    voteMutation.mutate({ proposalId: proposals[0].id.toString(), value: '0' });
  };

  useEffect(() => {
    if (idsInAllocation !== undefined) {
      onResetAllocationValues();
      setIsRenderingReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsInAllocation, userVote]);

  const changeAllocationItemValue = (id: number, value: number) => {
    const allocationsWithPositiveValues = getAllocationsWithPositiveValues(allocationValues!);
    const allocationsWithPositiveValuesKeys = Object.keys(allocationsWithPositiveValues);
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

  const isButtonsDisabled = !isConnected || !isDecisionWindowOpen;
  return (
    <MainLayout
      isLoading={!isRenderingReady || (isConnected && isFetchingUserVote)}
      navigationBottomSuffix={
        <div className={styles.buttons}>
          <Button
            className={styles.button}
            isDisabled={isButtonsDisabled}
            label="Reset"
            onClick={onResetAllocationValues}
          />
          <Button
            className={styles.button}
            Icon={voteMutation.isLoading && <Loader />}
            isDisabled={isButtonsDisabled}
            isLoading={voteMutation.isLoading}
            label="Allocate"
            onClick={onVote}
            variant="cta"
          />
        </div>
      }
    >
      <div className={styles.boxes}>
        {!isDecisionWindowOpen && (
          <BoxRounded alignment="center" className={styles.box}>
            The decision window is now closed. Allocating funds is not possible.
          </BoxRounded>
        )}
        {!isConnected && (
          <BoxRounded alignment="center" className={styles.box}>
            In order to manipulate allocation values and vote, please connect your wallet first.
          </BoxRounded>
        )}
        {allocationValues && idsInAllocation
          ? idsInAllocation.map((idInAllocation, index) => {
              const allocationItem = proposals.find(({ id }) => id.toNumber() === idInAllocation)!;
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
                  value={value}
                  {...allocationItem}
                />
              );
            })
          : null}
      </div>
      {selectedItemId !== null && (
        <div className={styles.selectedItemOverlay} onClick={() => setSelectedItemId(null)} />
      )}
    </MainLayout>
  );
};

export default AllocationView;
