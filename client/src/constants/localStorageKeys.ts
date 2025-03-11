const SPACER = '_';
const getLocalStorageKey = (prefix: string, suffix: string): string =>
  `${prefix}${SPACER}${suffix}`;

// Allocation
const allocationPrefix = 'allocation';
export const ALLOCATION_ITEMS_KEY = getLocalStorageKey(allocationPrefix, 'items');
export const ALLOCATION_REWARDS_FOR_PROJECTS = getLocalStorageKey(
  allocationPrefix,
  'rewardsForProjects',
);

// Projects
const projectsPrefix = 'projects';
export const PROJECTS_ADDRESSES_RANDOMIZED_ORDER = getLocalStorageKey(
  projectsPrefix,
  'addressesRandomizedOrder',
);

// Onboarding
const onboardingPrefix = 'onboarding';
export const IS_ONBOARDING_DONE = getLocalStorageKey(onboardingPrefix, 'isOnboardingDone');
export const HAS_ONBOARDING_BEEN_CLOSED = getLocalStorageKey(
  onboardingPrefix,
  'hasOnboardingBeenClosed',
);
export const LAST_SEEN_STEP = getLocalStorageKey(onboardingPrefix, 'lastSeenStep');

// Settings
const settingsPrefix = 'settings';
export const IS_ONBOARDING_ALWAYS_VISIBLE = getLocalStorageKey(
  settingsPrefix,
  'isOnboardingAlwaysVisible',
);
export const DISPLAY_CURRENCY = getLocalStorageKey(settingsPrefix, 'displayCurrency');

export const IS_CRYPTO_MAIN_VALUE_DISPLAY = getLocalStorageKey(
  settingsPrefix,
  'isCryptoMainValueDisplay',
);

export const SHOW_HELP_VIDEOS = getLocalStorageKey(settingsPrefix, 'showHelpVideos');

export const LANGUAGE_UI = getLocalStorageKey(settingsPrefix, 'languageUI');

export const IS_QUICKTOUR_ALWAYS_VISIBLE = getLocalStorageKey(
  settingsPrefix,
  'isQuickTourAlwaysVisible',
);

// Delegation
const delegationPrefix = 'delegation_5';

export const IS_DELEGATION_COMPLETED = getLocalStorageKey(
  delegationPrefix,
  'isDelegationCompleted',
);

export const DELEGATION_PRIMARY_ADDRESS = getLocalStorageKey(
  delegationPrefix,
  'delegationPrimaryAddress',
);

export const DELEGATION_SECONDARY_ADDRESS = getLocalStorageKey(
  delegationPrefix,
  'delegationSecondaryAddress',
);

export const PRIMARY_ADDRESS_SCORE = getLocalStorageKey(delegationPrefix, 'primaryAddressScore_5');

export const SECONDARY_ADDRESS_SCORE = getLocalStorageKey(
  delegationPrefix,
  'secondaryAddressScore',
);

export const TIMEOUT_LIST_PRESENCE_MODAL_OPEN = getLocalStorageKey(
  delegationPrefix,
  'timeoutListPresenceModalOpen',
);
