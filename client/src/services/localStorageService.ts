import {
  ALLOCATION_ITEMS_KEY,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'constants/localStorageKeys';
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

  const validateAllocationItems = (): void => {
    const allocationItems = JSON.parse(localStorage.getItem(ALLOCATION_ITEMS_KEY) || 'null');

    if (!Array.isArray(allocationItems)) {
      localStorage.removeItem(ALLOCATION_ITEMS_KEY);
      return;
    }

    if (allocationItems.find(element => typeof element !== 'number')) {
      localStorage.removeItem(ALLOCATION_ITEMS_KEY);
    }
  };

  const validateIsOnboardingAlwaysVisible = (): void => {
    const isOnboardingAlwaysVisible = localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE);

    if (isOnboardingAlwaysVisible !== 'true' && isOnboardingAlwaysVisible !== 'false') {
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
    }
  };

  const validateIsOnboardingDone = (): void => {
    const isOnboardingDone = localStorage.getItem(IS_ONBOARDING_DONE);
    const isOnboardingAlwaysVisible = localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE);

    if (isOnboardingAlwaysVisible === 'true') {
      localStorage.setItem(IS_ONBOARDING_DONE, 'false');
    }

    if (isOnboardingDone !== 'true' && isOnboardingDone !== 'false') {
      localStorage.setItem(IS_ONBOARDING_DONE, 'false');
    }
  };

  const init = (): void => {
    validateLocalStorageJsons();
    validateAllocationItems();
    validateIsOnboardingAlwaysVisible();
    validateIsOnboardingDone();
  };

  return {
    init,
  };
};

const localStorageService = LocalStorageService();

export default localStorageService;
