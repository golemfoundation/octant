import cx from 'classnames';
import { BigNumber } from 'ethers';
import isEmpty from 'lodash/isEmpty';
import React, { Fragment, ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import AllocationEmptyState from 'components/dedicated/AllocationEmptyState/AllocationEmptyState';
import AllocationInfoBoxes from 'components/dedicated/AllocationInfoBoxes/AllocationInfoBoxes';
import AllocationItem from 'components/dedicated/AllocationItem/AllocationItem';
import { AllocationItemWithAllocations } from 'components/dedicated/AllocationItem/types';
import AllocationNavigation from 'components/dedicated/AllocationNavigation/AllocationNavigation';
import AllocationSummary from 'components/dedicated/AllocationSummary/AllocationSummary';
import TipTile from 'components/dedicated/TipTile/TipTile';
import useAllocate from 'hooks/mutations/useAllocate';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useDepositValue from 'hooks/queries/useDepositValue';
import useIndividualProposalRewards from 'hooks/queries/useIndividualProposalRewards';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposalsContract from 'hooks/queries/useProposalsContract';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import MainLayout from 'layouts/MainLayout/MainLayout';
import useAllocationsStore from 'store/allocations/store';
import useTipsStore from 'store/tips/store';
import getNewAllocationValuesBigNumber from 'utils/getNewAllocationValuesBigNumber';
import getSortedElementsByTotalValueOfAllocations from 'utils/getSortedElementsByTotalValueOfAllocations';
import triggerToast from 'utils/triggerToast';

import styles from './AllocationView.module.scss';
import { AllocationValues, CurrentView } from './types';
import {
  getAllocationValuesInitialState,
  getAllocationsWithPositiveValues,
  toastBudgetExceeding,
} from './utils';

const AllocationView = (): ReactElement => {
  const { isConnected } = useAccount();
  const { t, i18n } = useTranslation('translation', { keyPrefix: 'views.allocation' });
  const { allocations } = useAllocationsStore(state => ({
    allocations: state.data.allocations,
  }));
  const {
    wasConnectWalletAlreadyClosed,
    wasLockGLMAlreadyClosed,
    wasRewardsAlreadyClosed,
    setWasConnectWalletAlreadyClosed,
    setWasLockGLMAlreadyClosed,
    setWasRewardsAlreadyClosed,
  } = useTipsStore(state => ({
    setWasConnectWalletAlreadyClosed: state.setWasConnectWalletAlreadyClosed,
    setWasLockGLMAlreadyClosed: state.setWasLockGLMAlreadyClosed,
    setWasRewardsAlreadyClosed: state.setWasRewardsAlreadyClosed,
    wasConnectWalletAlreadyClosed: state.data.wasConnectWalletAlreadyClosed,
    wasLockGLMAlreadyClosed: state.data.wasLockGLMAlreadyClosed,
    wasRewardsAlreadyClosed: state.data.wasRewardsAlreadyClosed,
  }));
  const { data: proposals } = useProposalsContract();
  const [currentView, setCurrentView] = useState<CurrentView>('edit');
  const [selectedItemAddress, setSelectedItemAddress] = useState<null | string>(null);
  const [allocationValues, setAllocationValues] = useState<undefined | AllocationValues>(undefined);
  const {
    data: userAllocations,
    isFetching: isFetchingUserAllocation,
    refetch: refetchUserAllocation,
  } = useUserAllocations({ refetchOnMount: true });
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: depositsValue } = useDepositValue();
  const { data: individualReward } = useIndividualReward();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { refetch: refetchIndividualProposalRewards } = useIndividualProposalRewards();
  const { refetch: refetchAllocations } = useUserAllocations();
  const { data: matchedProposalRewards, refetch: refetchMatchedProposalRewards } =
    useMatchedProposalRewards();
  const allocateMutation = useAllocate({
    onSuccess: async () => {
      setCurrentView('edit');
      setSelectedItemAddress(null);
      triggerToast({
        title: t('allocationSuccessful'),
      });
      await refetchMatchedProposalRewards();
      await refetchUserAllocation();
      await refetchAllocations();
      await refetchIndividualProposalRewards();
    },
  });

  const allocationsWithPositiveValues = allocationValues
    ? getAllocationsWithPositiveValues(allocationValues)
    : [];

  const onResetAllocationValues = () => {
    const allocationValuesInitValue = getAllocationValuesInitialState(allocations, userAllocations);
    setAllocationValues(allocationValuesInitValue);
  };

  useEffect(() => {
    onResetAllocationValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAllocations]);

  const onAllocate = () => {
    const allocateMutationArgs =
      allocationsWithPositiveValues.length > 0
        ? allocationsWithPositiveValues
        : [
            {
              proposalAddress: proposals![0],
              value: '0',
            },
          ];
    allocateMutation.mutate(allocateMutationArgs);
  };

  const onChangeAllocationItemValue = (proposalAddressToModify: string, newValue: string) => {
    if (allocateMutation.isLoading || !individualReward) {
      return;
    }

    // When value === '', we keep it as undefined, for check in AllocationItem.tsx mapping to BigNumber.
    const newValueProcessed = newValue === '' ? undefined : newValue;

    const newAllocationsWithPositiveValues = allocationsWithPositiveValues.map(element =>
      element.proposalAddress === proposalAddressToModify
        ? {
            ...element,
            value: newValue,
          }
        : element,
    );
    if (
      !newAllocationsWithPositiveValues.find(
        ({ proposalAddress }) => proposalAddress === proposalAddressToModify,
      ) &&
      newValue
    ) {
      newAllocationsWithPositiveValues.push({
        proposalAddress: proposalAddressToModify,
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
      [proposalAddressToModify]: newValueProcessed,
    }));
  };

  const isLoading = allocationValues === undefined || (isConnected && isFetchingUserAllocation);
  const areButtonsDisabled =
    isLoading || !isConnected || !isDecisionWindowOpen || !!individualReward?.isZero();
  const areAllocationsAvailable = allocationValues !== undefined && !isEmpty(allocations);

  let allocationsWithRewards =
    proposals && proposals.length > 0 && areAllocationsAvailable
      ? allocations!.map(addressInAllocation => {
          const allocationItemAddress = proposals.find(address => address === addressInAllocation)!;
          const proposalMatchedProposalRewards = matchedProposalRewards?.find(
            ({ address }) => address === addressInAllocation,
          );
          const isSelected = selectedItemAddress === allocationItemAddress;
          const value = allocationValues[allocationItemAddress];
          const isAllocatedTo = !!userAllocations?.find(
            ({ proposalAddress }) => proposalAddress === addressInAllocation,
          );

          return {
            address: allocationItemAddress,
            isAllocatedTo,
            isSelected,
            percentage: proposalMatchedProposalRewards?.percentage,
            totalValueOfAllocations: proposalMatchedProposalRewards?.sum,
            value,
          };
        })
      : [];

  allocationsWithRewards =
    !!currentEpoch && currentEpoch > 1 && matchedProposalRewards
      ? (getSortedElementsByTotalValueOfAllocations(
          allocationsWithRewards,
        ) as AllocationItemWithAllocations[])
      : allocationsWithRewards;

  const isConnectWalletTipVisible = !isConnected && !wasConnectWalletAlreadyClosed;

  const isLockGlmTipVisible =
    (!depositsValue || (!!depositsValue && depositsValue.isZero())) &&
    isConnected &&
    !wasLockGLMAlreadyClosed;

  const isRewardsTipVisible =
    isConnected && individualReward && !individualReward.isZero && !wasRewardsAlreadyClosed;

  return (
    <MainLayout
      dataTest="AllocationView"
      isLoading={isLoading}
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
          {isConnectWalletTipVisible && (
            <TipTile
              className={styles.tip}
              image="images/tip-connect-wallet.webp"
              infoLabel={i18n.t('common.gettingStarted')}
              onClose={() => setWasConnectWalletAlreadyClosed(true)}
              text={t('tip.connectWallet.text')}
              title={t('tip.connectWallet.title')}
            />
          )}
          {isLockGlmTipVisible && (
            <TipTile
              className={styles.tip}
              image="images/tip-lock-glm.webp"
              infoLabel={i18n.t('common.gettingStarted')}
              onClose={() => setWasLockGLMAlreadyClosed(true)}
              text={t('tip.lockGlm.text')}
              title={t('tip.lockGlm.title')}
            />
          )}
          {isRewardsTipVisible && (
            <TipTile
              className={styles.tip}
              image="images/tip-rewards.webp"
              infoLabel={i18n.t('common.octantTips')}
              onClose={() => setWasRewardsAlreadyClosed(true)}
              text={t('tip.rewards.text')}
              title={t('tip.rewards.title')}
            />
          )}
          {areAllocationsAvailable ? (
            <div className={styles.boxes}>
              <AllocationInfoBoxes
                classNameBox={styles.box}
                isConnected={isConnected}
                isDecisionWindowOpen={!!isDecisionWindowOpen}
              />
              {allocationsWithRewards!.map((allocation, index) => (
                <AllocationItem
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  className={cx(
                    styles.box,
                    styles.isAllocation,
                    allocation.isSelected && styles.isSelected,
                  )}
                  onChange={onChangeAllocationItemValue}
                  onSelectItem={setSelectedItemAddress}
                  {...allocation}
                />
              ))}
            </div>
          ) : (
            <AllocationEmptyState />
          )}
          {selectedItemAddress !== null && (
            <div
              className={styles.selectedItemOverlay}
              onClick={() => setSelectedItemAddress(null)}
            />
          )}
        </Fragment>
      ) : (
        <AllocationSummary allocations={allocations} allocationValues={allocationValues!} />
      )}
    </MainLayout>
  );
};

export default AllocationView;
