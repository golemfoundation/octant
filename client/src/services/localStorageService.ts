import { BigNumber } from 'ethers';

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
  ALLOCATION_REWARDS_FOR_PROPOSALS,
} from 'constants/localStorageKeys';
import { initialState as settingsStoreInitialState } from 'store/settings/store';
import { initialState as tipsStoreInitialState } from 'store/tips/store';
import isStringValidJson from 'utils/isStringValidJson';

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

  const validateBigNumber = (localStorageKey: string): void => {
    let value;
    try {
      value = BigNumber.from(JSON.parse(localStorage.getItem(localStorageKey) || 'null'));
    } catch (e) {
      value = '';
    }

    if (!BigNumber.isBigNumber(value)) {
      localStorage.setItem(localStorageKey, JSON.stringify(BigNumber.from(0)));
    }
  };

  const validateAllocationItems = (): void => {
    const allocationItems = JSON.parse(localStorage.getItem(ALLOCATION_ITEMS_KEY) || 'null');
    if (!Array.isArray(allocationItems)) {
      localStorage.removeItem(ALLOCATION_ITEMS_KEY);
      return;
    }

    if (allocationItems.find(proposalAddress => typeof proposalAddress !== 'string')) {
      localStorage.removeItem(ALLOCATION_ITEMS_KEY);
    }
  };

  const validateIsOnboardingAlwaysVisible = (): void => {
    validateBoolean(IS_ONBOARDING_ALWAYS_VISIBLE);
  };

  const validateIsOnboardingDone = (): void => {
    const isOnboardingAlwaysVisible = localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE);

    if (isOnboardingAlwaysVisible === 'true') {
      localStorage.setItem(
        IS_ONBOARDING_DONE,
        JSON.stringify(settingsStoreInitialState.isAllocateOnboardingAlwaysVisible),
      );
    }

    validateBoolean(IS_ONBOARDING_DONE);
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

  const validateRewardsForProposals = (): void =>
    validateBigNumber(ALLOCATION_REWARDS_FOR_PROPOSALS);

  const init = (): void => {
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
    validateRewardsForProposals();
  };

  return {
    init,
  };
};

const localStorageService = LocalStorageService();

export default localStorageService;
