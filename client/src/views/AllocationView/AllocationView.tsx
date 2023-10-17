import cx from 'classnames';
import { BigNumber } from 'ethers';
import isEmpty from 'lodash/isEmpty';
import React, { Fragment, ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import AllocateRewardsBox from 'components/dedicated/AllocateRewardsBox/AllocateRewardsBox';
import AllocationEmptyState from 'components/dedicated/AllocationEmptyState/AllocationEmptyState';
import AllocationItem from 'components/dedicated/AllocationItem/AllocationItem';
import AllocationNavigation from 'components/dedicated/AllocationNavigation/AllocationNavigation';
import AllocationSummary from 'components/dedicated/AllocationSummary/AllocationSummary';
import AllocationTipTiles from 'components/dedicated/AllocationTipTiles/AllocationTipTiles';
import ModalAllocationValuesEdit from 'components/dedicated/ModalAllocationValuesEdit/ModalAllocationValuesEdit';
import useAllocate from 'hooks/events/useAllocate';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useHistory from 'hooks/queries/useHistory';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposalsContract from 'hooks/queries/useProposalsContract';
import useProposalsIpfs from 'hooks/queries/useProposalsIpfs';
import useProposalsIpfsWithRewards from 'hooks/queries/useProposalsIpfsWithRewards';
import useUserAllocationNonce from 'hooks/queries/useUserAllocationNonce';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import MainLayout from 'layouts/MainLayout/MainLayout';
import useAllocationsStore from 'store/allocations/store';
import triggerToast from 'utils/triggerToast';

import styles from './AllocationView.module.scss';
import { AllocationValues, CurrentView } from './types';
import {
  getAllocationValuesInitialState,
  getAllocationsWithRewards,
  getRestToDistribute,
  getNewAllocationValues,
} from './utils';

const AllocationView = (): ReactElement => {
  const { isConnected } = useAccount();
  const { t } = useTranslation('translation', { keyPrefix: 'views.allocation' });
  const [currentView, setCurrentView] = useState<CurrentView>('edit');
  const [isLocked, setIsLocked] = useState<boolean | undefined>(undefined);
  const [selectedItemAddress, setSelectedItemAddress] = useState<null | string>(null);
  const [allocationValues, setAllocationValues] = useState<AllocationValues>([]);
  const [allocationsEdited, setAllocationsEdited] = useState<string[]>([]);
  const { data: proposalsContract } = useProposalsContract();
  const { data: proposalsIpfs } = useProposalsIpfs(proposalsContract);
  const { data: proposalsIpfsWithRewards } = useProposalsIpfsWithRewards();

  const { data: currentEpoch } = useCurrentEpoch();
  const { refetch: refetchHistory } = useHistory();
  const {
    data: userAllocations,
    isFetching: isFetchingUserAllocation,
    refetch: refetchUserAllocations,
  } = useUserAllocations(currentEpoch, { refetchOnMount: true });
  const { data: individualReward } = useIndividualReward();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const {
    data: userNonce,
    isFetching: isFetchingUserNonce,
    refetch: refetchUserAllocationNonce,
  } = useUserAllocationNonce();
  const { refetch: refetchMatchedProposalRewards } = useMatchedProposalRewards();
  const { allocations, rewardsForProposals, setAllocations } = useAllocationsStore(state => ({
    allocations: state.data.allocations,
    rewardsForProposals: state.data.rewardsForProposals,
    setAllocations: state.setAllocations,
  }));

  const allocateEvent = useAllocate({
    nonce: userNonce!,
    onSuccess: async () => {
      setCurrentView('edit');
      setSelectedItemAddress(null);
      triggerToast({
        title: t('allocationSuccessful'),
      });
      await refetchMatchedProposalRewards();
      await refetchUserAllocations();
      await refetchUserAllocationNonce();
      await refetchHistory();
      setAllocations([
        ...allocations.filter(allocation => {
          const allocationValue = allocationValues.find(({ address }) => address === allocation);
          return !allocationValue?.value.isZero();
        }),
      ]);
    },
  });

  const onResetAllocationValues = () => {
    if (
      currentEpoch === undefined ||
      isLocked === undefined ||
      (isConnected && !userAllocations && currentEpoch > 1) ||
      !rewardsForProposals
    ) {
      return;
    }
    const allocationValuesNew = getAllocationValuesInitialState({
      allocations,
      isLocked,
      rewardsForProposals,
      userAllocationsElements: userAllocations?.elements,
    });
    setAllocationsEdited([]);
    setAllocationValues(allocationValuesNew);
  };

  useEffect(() => {
    if (isLocked === undefined) {
      return;
    }
    onResetAllocationValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocked]);

  useEffect(() => {
    onResetAllocationValues();
    /**
     * This hook should NOT run when user unlocks the allocation.
     * Only when userAllocations are fetched OR after rewardsForProposals value changes.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEpoch, allocations, userAllocations?.elements.length, rewardsForProposals]);

  const onAllocate = () => {
    if (userNonce === undefined || proposalsContract === undefined) {
      return;
    }
    /**
     * Whenever user wants to send an empty allocation (no projects, or all of them value 0)
     * Push one element with value 0. It should be fixed on BE by creating "personal all" endpoint,
     * but there is no ticket for it yet.
     */
    const allocationValuesNew = [...allocationValues];
    if (allocationValuesNew.length === 0) {
      allocationValuesNew.push({
        address: proposalsContract[0],
        value: BigNumber.from(0),
      });
    }
    allocateEvent.emit(allocationValuesNew);
  };

  useEffect(() => {
    if (!currentEpoch) {
      return;
    }
    if (userAllocations && currentEpoch > 1) {
      setIsLocked(userAllocations.hasUserAlreadyDoneAllocation);
      return;
    }
    setIsLocked(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEpoch, userAllocations?.elements.length]);

  const onChangeAllocationItemValue = (proposalAddressToModify: string, newValue: BigNumber) => {
    const isProposalAddressToModifyEdited = allocationsEdited.includes(proposalAddressToModify);
    const allocationsEditedNew = isProposalAddressToModifyEdited
      ? allocationsEdited
      : [...allocationsEdited, proposalAddressToModify];
    if (!isProposalAddressToModifyEdited) {
      setAllocationsEdited(allocationsEditedNew);
    }

    const newAllocationValues = getNewAllocationValues({
      allocationValues,
      allocationsEdited: allocationsEditedNew,
      individualReward,
      newValue,
      proposalAddressToModify,
      rewardsForProposals,
    });

    setAllocationValues(newAllocationValues);
  };

  const isLoading =
    allocationValues === undefined ||
    (isConnected && isFetchingUserNonce) ||
    (isConnected && isFetchingUserAllocation);
  const areAllocationsAvailableOrAlreadyDone =
    (allocationValues !== undefined && !isEmpty(allocations)) ||
    !!userAllocations?.hasUserAlreadyDoneAllocation;
  const areButtonsDisabled =
    isLoading ||
    !isConnected ||
    !isDecisionWindowOpen ||
    isLocked ||
    (!areAllocationsAvailableOrAlreadyDone && !rewardsForProposals.isZero()) ||
    !!individualReward?.isZero();

  const allocationsWithRewards = getAllocationsWithRewards({
    allocationValues,
    areAllocationsAvailableOrAlreadyDone,
    proposalsIpfsWithRewards,
    userAllocationsElements: userAllocations?.elements,
  });

  const selectedItemName = selectedItemAddress
    ? proposalsIpfs?.find(({ address }) => address === selectedItemAddress)!.name
    : '';

  const restToDistribute = getRestToDistribute({
    allocationValues,
    allocationsEdited,
    individualReward,
    rewardsForProposals,
  });

  const isEpoch1 = currentEpoch === 1;

  return (
    <MainLayout
      dataTest="AllocationView"
      isLoading={isLoading}
      navigationBottomSuffix={
        !isEpoch1 && (
          <AllocationNavigation
            areButtonsDisabled={areButtonsDisabled}
            currentView={currentView}
            isLoading={allocateEvent.isLoading}
            onAllocate={onAllocate}
            onResetValues={onResetAllocationValues}
            setCurrentView={setCurrentView}
          />
        )
      }
    >
      {currentView === 'edit' ? (
        <Fragment>
          <AllocationTipTiles className={styles.box} />
          {!isEpoch1 && individualReward && !individualReward.isZero() && (
            <AllocateRewardsBox
              className={styles.box}
              isDisabled={isLocked}
              /* eslint-disable-next-line @typescript-eslint/naming-convention */
              onUnlock={() => setIsLocked(prev => !prev)}
            />
          )}
          {areAllocationsAvailableOrAlreadyDone && (
            <Fragment>
              {allocationsWithRewards!.map((allocation, index) => (
                <AllocationItem
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  className={cx(styles.box, styles.isAllocation)}
                  isDisabled={
                    isLocked || (restToDistribute.isZero() && allocationsEdited.length === 0)
                  }
                  isLocked={!!isLocked}
                  isManuallyEdited={allocationsEdited.includes(allocation.address)}
                  onSelectItem={setSelectedItemAddress}
                  {...allocation}
                />
              ))}
            </Fragment>
          )}
          {!areAllocationsAvailableOrAlreadyDone && individualReward?.isZero() && (
            <AllocationEmptyState />
          )}
          {!areAllocationsAvailableOrAlreadyDone && individualReward?.isZero() && (
            <AllocationEmptyState />
          )}
          <ModalAllocationValuesEdit
            isLimitVisible
            modalProps={{
              header: t('modalAllocationValuesEdit.header', { allocation: selectedItemName }),
              isOpen: selectedItemAddress !== null,
              onClosePanel: () => setSelectedItemAddress(null),
            }}
            onUpdateValue={newValue => {
              onChangeAllocationItemValue(selectedItemAddress!, newValue);
            }}
            restToDistribute={restToDistribute}
            valueCryptoSelected={
              selectedItemAddress && allocationValues
                ? allocationValues.find(({ address }) => address === selectedItemAddress)!.value
                : BigNumber.from(0)
            }
            valueCryptoTotal={rewardsForProposals}
          />
        </Fragment>
      ) : (
        <AllocationSummary allocationValues={allocationValues} />
      )}
    </MainLayout>
  );
};

export default AllocationView;
