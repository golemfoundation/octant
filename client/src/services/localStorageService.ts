import isEqual from 'lodash/isEqual';

import { Projects } from 'api/calls/projects';
import { DISPLAY_CURRENCIES } from 'constants/currencies';
import {
  ALLOCATION_ITEMS_KEY,
  DISPLAY_CURRENCY,
  IS_CRYPTO_MAIN_VALUE_DISPLAY,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
  WAS_ADD_FAVOURITES_ALREADY_CLOSED_TIP,
  WAS_CONNECT_WALLET_ALREADY_CLOSED_TIP,
  WAS_LOCK_GLM_ALREADY_CLOSED_TIP,
  WAS_REWARDS_ALREADY_CLOSED_TIP,
  WAS_WITHDRAW_ALREADY_CLOSED_TIP,
  ALLOCATION_REWARDS_FOR_PROJECTS,
  HAS_ONBOARDING_BEEN_CLOSED,
  LAST_SEEN_STEP,
  WAS_UQ_TOO_LOW_ALREADY_CLOSED_TIP,
  PROJECTS_ADDRESSES_RANDOMIZED_ORDER,
} from 'constants/localStorageKeys';
import { initialState as settingsStoreInitialState } from 'store/settings/store';
import { initialState as tipsStoreInitialState } from 'store/tips/store';
import { ProjectsAddressesRandomizedOrder } from 'types/localStorage';
import isStringValidJson from 'utils/isStringValidJson';

export type LocalStorageInitParams = {
  currentEpoch: number;
  isDecisionWindowOpen: boolean;
  projectsEpoch: Projects;
};

const LocalStorageService = () => {
  const validateLocalStorageJsons = (): void => {
    const localStorageElements = { ...localStorage };
    const localStorageKeys = Object.keys(localStorageElements);

    for (let i = 0; i < localStorageKeys.length; i++) {
      const localStorageKey = localStorageKeys[i];
      const localStorageElement = localStorage.getItem(localStorageKey);
      if (!isStringValidJson(localStorageElement)) {
        localStorage.removeItem(localStorageKey);
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const validateBoolean = (localStorageKey: string, defaultValue = false): void => {
    const value = JSON.parse(localStorage.getItem(localStorageKey) || 'null');

    if (value !== true && value !== false) {
      localStorage.setItem(localStorageKey, JSON.stringify(defaultValue));
    }
  };

  const validateBigInt = (localStorageKey: string): void => {
    let value;
    try {
      value = BigInt(JSON.parse(localStorage.getItem(localStorageKey) || ''));
    } catch (e) {
      value = '';
    }

    if (typeof value !== 'bigint') {
      localStorage.setItem(localStorageKey, JSON.stringify(BigInt(0).toString()));
    }
  };

  const validateNumber = (localStorageKey: string): void => {
    let value;
    try {
      value = parseFloat(JSON.parse(localStorage.getItem(localStorageKey) || ''));
    } catch (e) {
      value = '';
    }

    if (typeof value !== 'number') {
      localStorage.setItem(localStorageKey, '0');
    }
  };

  const validateAllocationItems = (): void => {
    const allocationItems = JSON.parse(localStorage.getItem(ALLOCATION_ITEMS_KEY) || 'null');
    if (!Array.isArray(allocationItems)) {
      localStorage.removeItem(ALLOCATION_ITEMS_KEY);
      return;
    }

    if (allocationItems.find(projectAddress => typeof projectAddress !== 'string')) {
      localStorage.removeItem(ALLOCATION_ITEMS_KEY);
    }
  };

  const validateIsOnboardingAlwaysVisible = (): void => {
    validateBoolean(IS_ONBOARDING_ALWAYS_VISIBLE);
  };

  const validateIsOnboardingDone = (): void => {
    validateBoolean(IS_ONBOARDING_DONE);
  };

  const validateHasOnboardingBeenClosed = (): void => {
    validateBoolean(HAS_ONBOARDING_BEEN_CLOSED);
  };

  const validateLastSeenStep = (): void => {
    validateNumber(LAST_SEEN_STEP);
  };

  const validateDisplayCurrency = (): void => {
    const displayCurrency = JSON.parse(localStorage.getItem(DISPLAY_CURRENCY) || 'null');

    if (!displayCurrency || !DISPLAY_CURRENCIES.includes(displayCurrency)) {
      localStorage.setItem(
        DISPLAY_CURRENCY,
        JSON.stringify(settingsStoreInitialState.displayCurrency),
      );
    }
  };

  const validateIsCryptoMainValueDisplay = (): void => {
    validateBoolean(
      IS_CRYPTO_MAIN_VALUE_DISPLAY,
      settingsStoreInitialState.isCryptoMainValueDisplay,
    );
  };

  const validateWasAddFavouritesAlreadyClosed = (): void =>
    validateBoolean(
      WAS_ADD_FAVOURITES_ALREADY_CLOSED_TIP,
      tipsStoreInitialState.wasAddFavouritesAlreadyClosed,
    );

  const validateWasConnectWalletAlreadyClosed = (): void =>
    validateBoolean(
      WAS_CONNECT_WALLET_ALREADY_CLOSED_TIP,
      tipsStoreInitialState.wasConnectWalletAlreadyClosed,
    );

  const validateWasLockGLMAlreadyClosed = (): void =>
    validateBoolean(WAS_LOCK_GLM_ALREADY_CLOSED_TIP, tipsStoreInitialState.wasLockGLMAlreadyClosed);

  const validateWasRewardsAlreadyClosed = (): void =>
    validateBoolean(WAS_REWARDS_ALREADY_CLOSED_TIP, tipsStoreInitialState.wasRewardsAlreadyClosed);

  const validateWasWithdrawAlreadyClosed = (): void =>
    validateBoolean(
      WAS_WITHDRAW_ALREADY_CLOSED_TIP,
      tipsStoreInitialState.wasWithdrawAlreadyClosed,
    );

  const validateWasUqTooLowAlreadyClosed = (): void =>
    validateBoolean(
      WAS_UQ_TOO_LOW_ALREADY_CLOSED_TIP,
      tipsStoreInitialState.wasUqTooLowAlreadyClosed,
    );

  const validateProjectsAddressesRandomizedOrder = ({
    currentEpoch,
    projectsEpoch,
    isDecisionWindowOpen,
  }: LocalStorageInitParams): void => {
    const projectsAddressesRandomizedOrder = JSON.parse(
      localStorage.getItem(PROJECTS_ADDRESSES_RANDOMIZED_ORDER) || 'null',
    );

    // Validations in case data is set.
    if (projectsAddressesRandomizedOrder !== null) {
      // Invalid structure of an object, remove.
      if (
        !projectsAddressesRandomizedOrder.epoch ||
        !projectsAddressesRandomizedOrder.addressesRandomizedOrder ||
        typeof projectsAddressesRandomizedOrder.epoch !== 'number' ||
        !Array.isArray(projectsAddressesRandomizedOrder.addressesRandomizedOrder) ||
        projectsAddressesRandomizedOrder.addressesRandomizedOrder.length === 0
      ) {
        localStorage.removeItem(PROJECTS_ADDRESSES_RANDOMIZED_ORDER);
      } else if (!isDecisionWindowOpen) {
        // When AW is closed, remove.
        localStorage.removeItem(PROJECTS_ADDRESSES_RANDOMIZED_ORDER);
      } else if (projectsAddressesRandomizedOrder.epoch !== currentEpoch) {
        // When epoch changed, remove.
        localStorage.removeItem(PROJECTS_ADDRESSES_RANDOMIZED_ORDER);
      } else if (
        // When length changed or elements do not match, remove (shouldn't be possible, but these are famous last words).
        !isEqual(
          projectsAddressesRandomizedOrder.addressesRandomizedOrder.sort(),
          projectsEpoch.projectsAddresses.sort(),
        )
      ) {
        localStorage.removeItem(PROJECTS_ADDRESSES_RANDOMIZED_ORDER);
      }
    }

    // getItem again, in case any of the previous removes happened.
    const projectsAddressesRandomizedOrderFresh = JSON.parse(
      localStorage.getItem(PROJECTS_ADDRESSES_RANDOMIZED_ORDER) || 'null',
    );

    if (projectsAddressesRandomizedOrderFresh === null) {
      if (isDecisionWindowOpen) {
        const projectsEpochRandomized = projectsEpoch.projectsAddresses.sort(
          () => 0.5 - Math.random(),
        );

        localStorage.setItem(
          PROJECTS_ADDRESSES_RANDOMIZED_ORDER,
          JSON.stringify({
            addressesRandomizedOrder: projectsEpochRandomized,
            epoch: currentEpoch,
          } as ProjectsAddressesRandomizedOrder),
        );
      }
    }
  };

  const validateRewardsForProjects = (): void => validateBigInt(ALLOCATION_REWARDS_FOR_PROJECTS);

  const init = (params: LocalStorageInitParams): void => {
    validateLocalStorageJsons();
    validateAllocationItems();
    validateIsOnboardingAlwaysVisible();
    validateIsOnboardingDone();
    validateDisplayCurrency();
    validateIsCryptoMainValueDisplay();
    validateWasAddFavouritesAlreadyClosed();
    validateWasConnectWalletAlreadyClosed();
    validateWasLockGLMAlreadyClosed();
    validateWasRewardsAlreadyClosed();
    validateWasWithdrawAlreadyClosed();
    validateWasUqTooLowAlreadyClosed();
    validateRewardsForProjects();
    validateHasOnboardingBeenClosed();
    validateLastSeenStep();
    validateProjectsAddressesRandomizedOrder(params);
  };

  return {
    init,
  };
};

const localStorageService = LocalStorageService();

export default localStorageService;
