import { useEffect } from 'react';
import { useAccount } from 'wagmi';

import { ALLOCATION_ITEMS_KEY } from 'constants/localStorageKeys';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useProposalsContract from 'hooks/queries/useProposalsContract';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useAllocationsStore from 'store/allocations/store';
import useSettingsStore from 'store/settings/store';
import useTipsStore from 'store/tips/store';
import getValidatedProposalsFromLocalStorage from 'utils/getValidatedProposalsFromLocalStorage';

import useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow from './useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow';

export default function useAppPopulateState(): void {
  const { isConnected } = useAccount();

  const { data: proposals } = useProposalsContract();
  const { data: userAllocations } = useUserAllocations();
  const {
    data: areCurrentEpochsProjectsHiddenOutsideAllocationWindow,
    isLoading: isLoadingAreCurrentEpochsProjectsHiddenOutsideAllocationWindow,
  } = useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow();

  const { allocations, setAllocations, addAllocations, isAllocationsInitialized } =
    useAllocationsStore(state => ({
      addAllocations: state.addAllocations,
      allocations: state.data.allocations,
      isAllocationsInitialized: state.meta.isInitialized,
      reset: state.reset,
      setAllocations: state.setAllocations,
    }));
  const { setInitialState: setInitialStateTips } = useTipsStore(state => ({
    setInitialState: state.setInitialState,
  }));
  const { areOctantTipsAlwaysVisible, displayCurrency, setIsCryptoMainValueDisplay } =
    useSettingsStore(state => ({
      areOctantTipsAlwaysVisible: state.data.areOctantTipsAlwaysVisible,
      displayCurrency: state.data.displayCurrency,
      setIsCryptoMainValueDisplay: state.setIsCryptoMainValueDisplay,
    }));

  useEffect(() => {
    /**
     * This hook validates allocations in localStorage
     * and populates store with them or sets empty array.
     */
    if (
      !proposals ||
      proposals.length === 0 ||
      isAllocationsInitialized ||
      isLoadingAreCurrentEpochsProjectsHiddenOutsideAllocationWindow
    ) {
      return;
    }

    /**
     * When areCurrentEpochsProjectsHiddenOutsideAllocationWindow we set empty array.
     * We remove whatever user has in localStorage.
     * They can't add nor remove elements from allocate, they should not have anything there.
     */
    if (areCurrentEpochsProjectsHiddenOutsideAllocationWindow) {
      setAllocations([]);
      return;
    }

    const localStorageAllocationItems = JSON.parse(
      localStorage.getItem(ALLOCATION_ITEMS_KEY) || 'null',
    );

    if (!localStorageAllocationItems || localStorageAllocationItems.length === 0) {
      setAllocations([]);
      return;
    }

    const validatedProposalsInLocalStorage = getValidatedProposalsFromLocalStorage(
      localStorageAllocationItems,
      proposals,
    );
    if (validatedProposalsInLocalStorage) {
      setAllocations(validatedProposalsInLocalStorage);
    }
  }, [
    allocations,
    areCurrentEpochsProjectsHiddenOutsideAllocationWindow,
    isAllocationsInitialized,
    isConnected,
    isLoadingAreCurrentEpochsProjectsHiddenOutsideAllocationWindow,
    proposals,
    setAllocations,
  ]);

  useEffect(() => {
    /**
     * This hook adds userAllocations to the store.
     * This needs to be done after store is populated with values from localStorage.
     *
     * When areCurrentEpochsProjectsHiddenOutsideAllocationWindow === true we don't add
     * userAllocations to the store. AllocationView is empty, user can't add projects to it,
     * Navbar badge is not visible.
     */
    if (
      !userAllocations ||
      !isAllocationsInitialized ||
      isLoadingAreCurrentEpochsProjectsHiddenOutsideAllocationWindow ||
      areCurrentEpochsProjectsHiddenOutsideAllocationWindow
    ) {
      return;
    }
    const userAllocationsAddresses = userAllocations.elements.map(
      ({ address: userAllocationAddress }) => userAllocationAddress,
    );
    if (
      isConnected &&
      userAllocations &&
      userAllocations.elements.length > 0 &&
      !!allocations &&
      !allocations.some(allocation => userAllocationsAddresses.includes(allocation))
    ) {
      addAllocations(userAllocationsAddresses);
    }
  }, [
    addAllocations,
    allocations,
    areCurrentEpochsProjectsHiddenOutsideAllocationWindow,
    isAllocationsInitialized,
    isConnected,
    isLoadingAreCurrentEpochsProjectsHiddenOutsideAllocationWindow,
    userAllocations,
  ]);

  useEffect(() => {
    if (!areOctantTipsAlwaysVisible) {
      return;
    }

    setInitialStateTips();
  }, [areOctantTipsAlwaysVisible, setInitialStateTips]);

  useCryptoValues(displayCurrency, {
    onError: () => {
      setIsCryptoMainValueDisplay(true);
    },
  });
}
