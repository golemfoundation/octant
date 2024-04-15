import { useEffect } from 'react';
import { useAccount } from 'wagmi';

import { ALLOCATION_ITEMS_KEY } from 'constants/localStorageKeys';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useProjectsEpoch from 'hooks/queries/useProjectsEpoch';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useAllocationsStore from 'store/allocations/store';
import useSettingsStore from 'store/settings/store';
import useTipsStore from 'store/tips/store';
import getValidatedProjectsFromLocalStorage from 'utils/getValidatedProjectsFromLocalStorage';

import useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow from './useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow';

export default function useAppPopulateState(): void {
  const { isConnected } = useAccount();

  const { data: projectsEpoch } = useProjectsEpoch();
  const { data: userAllocations } = useUserAllocations();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
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
      !projectsEpoch ||
      projectsEpoch.projectsAddresses.length === 0 ||
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

    const validatedProjectsInLocalStorage = getValidatedProjectsFromLocalStorage(
      localStorageAllocationItems,
      projectsEpoch.projectsAddresses,
    );
    if (validatedProjectsInLocalStorage) {
      setAllocations(validatedProjectsInLocalStorage);
    }
  }, [
    allocations,
    areCurrentEpochsProjectsHiddenOutsideAllocationWindow,
    isAllocationsInitialized,
    isConnected,
    isLoadingAreCurrentEpochsProjectsHiddenOutsideAllocationWindow,
    projectsEpoch,
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
      !isDecisionWindowOpen ||
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
      (!allocations.every(allocation => userAllocationsAddresses.includes(allocation)) ||
        !userAllocationsAddresses.every(address => allocations.includes(address)))
    ) {
      addAllocations(userAllocationsAddresses.filter(element => !allocations.includes(element)));
    }
    /**
     * This hook should not run on allocations change.
     * allocations are changed by the user by adding/removing them from the list,
     * it should not repopulate the store because it would cause infinite loop.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    addAllocations,
    areCurrentEpochsProjectsHiddenOutsideAllocationWindow,
    isAllocationsInitialized,
    isDecisionWindowOpen,
    isConnected,
    isLoadingAreCurrentEpochsProjectsHiddenOutsideAllocationWindow,
    userAllocations?.elements.length,
  ]);

  useEffect(() => {
    if (!areOctantTipsAlwaysVisible) {
      return;
    }

    setInitialStateTips();
  }, [areOctantTipsAlwaysVisible, setInitialStateTips]);

  const cryptoValuesQuery = useCryptoValues(displayCurrency);

  useEffect(() => {
    if (!cryptoValuesQuery.error) {
      return;
    }
    setIsCryptoMainValueDisplay(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cryptoValuesQuery.error]);
}
