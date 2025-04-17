import isEqual from 'lodash/isEqual';

import { Projects } from 'api/calls/projects';
import { DISPLAY_CURRENCIES } from 'constants/currencies';
import {
  ALLOCATION_ITEMS_KEY,
  DISPLAY_CURRENCY,
  IS_CRYPTO_MAIN_VALUE_DISPLAY,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
  ALLOCATION_REWARDS_FOR_PROJECTS,
  HAS_ONBOARDING_BEEN_CLOSED,
  LAST_SEEN_STEP,
  PROJECTS_ADDRESSES_RANDOMIZED_ORDER,
  TIMEOUT_LIST_PRESENCE_MODAL_OPEN,
  SHOW_HELP_VIDEOS,
  LANGUAGE_UI,
  IS_QUICKTOUR_ALWAYS_VISIBLE,
} from 'constants/localStorageKeys';
import { languageKey } from 'i18n/languages';
import { initialState as settingsStoreInitialState } from 'store/settings/store';
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
      // LANGUAGE_UI is excluded. It's set as JSON, but then it's overridden by i18n library.
      if (!isStringValidJson(localStorageElement) && localStorageKey !== LANGUAGE_UI) {
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

  const validateIsQuickTourAlwaysVisible = (): void => {
    validateBoolean(IS_QUICKTOUR_ALWAYS_VISIBLE, true);
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

  const validateShowHelpVideos = (): void => {
    validateBoolean(SHOW_HELP_VIDEOS, settingsStoreInitialState.showHelpVideos);
  };

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

  const validateTimeoutListPresenceModalClosed = (): void => {
    const timeoutListPresenceModalOpen = JSON.parse(
      localStorage.getItem(TIMEOUT_LIST_PRESENCE_MODAL_OPEN) || 'null',
    );

    if (!timeoutListPresenceModalOpen) {
      return;
    }

    if (
      !timeoutListPresenceModalOpen.address ||
      ![true, false].includes(timeoutListPresenceModalOpen.value)
    ) {
      localStorage.removeItem(TIMEOUT_LIST_PRESENCE_MODAL_OPEN);
    }
  };

  const validateLanguageUi = (): void => {
    const languageUi = localStorage.getItem(LANGUAGE_UI);

    if (languageUi && !Object.values(languageKey).includes(languageUi)) {
      localStorage.removeItem(LANGUAGE_UI);
    }
  };

  const init = (params: LocalStorageInitParams): void => {
    validateLocalStorageJsons();
    validateAllocationItems();
    validateIsOnboardingAlwaysVisible();
    validateIsQuickTourAlwaysVisible();
    validateIsOnboardingDone();
    validateDisplayCurrency();
    validateIsCryptoMainValueDisplay();
    validateShowHelpVideos();
    validateRewardsForProjects();
    validateHasOnboardingBeenClosed();
    validateLastSeenStep();
    validateProjectsAddressesRandomizedOrder(params);
    validateTimeoutListPresenceModalClosed();
    validateLanguageUi();
  };

  return {
    init,
  };
};

const localStorageService = LocalStorageService();

export default localStorageService;
