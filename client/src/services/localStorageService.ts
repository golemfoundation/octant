import { DISPLAY_CURRENCIES } from 'constants/currencies';
import {
  ALLOCATION_ITEMS_KEY,
  DISPLAY_CURRENCY,
  IS_CRYPTO_MAIN_VALUE_DISPLAY,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'constants/localStorageKeys';
import isStringValidJson from 'utils/isStringValidJson';

const LocalStorageService = () => {
  const validateBoolean = (localStorageKey: string, defaultValue = 'false'): void => {
    const value = JSON.parse(localStorage.getItem(localStorageKey) || 'null');

    if (value !== true && value !== false) {
      localStorage.setItem(localStorageKey, defaultValue);
    }
  };

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
      localStorage.setItem(IS_ONBOARDING_DONE, 'false');
    }

    validateBoolean(IS_ONBOARDING_DONE);
  };

  const validateDisplayCurrency = (): void => {
    const displayCurrency = JSON.parse(localStorage.getItem(DISPLAY_CURRENCY) || 'null');

    if (!displayCurrency || !DISPLAY_CURRENCIES.includes(displayCurrency)) {
      localStorage.setItem(DISPLAY_CURRENCY, 'usd');
    }
  };

  const validateIsCryptoMainValueDisplay = (): void => {
    validateBoolean(IS_CRYPTO_MAIN_VALUE_DISPLAY, 'true');
  };

  const init = (): void => {
    validateLocalStorageJsons();
    validateAllocationItems();
    validateIsOnboardingAlwaysVisible();
    validateIsOnboardingDone();
    validateDisplayCurrency();
    validateIsCryptoMainValueDisplay();
  };

  return {
    init,
  };
};

const localStorageService = LocalStorageService();

export default localStorageService;
