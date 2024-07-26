const SPACER = '_';
const getLocalStorageKey = (prefix: string, suffix: string): string =>
  `${prefix}${SPACER}${suffix}`;

const allocationPrefix = 'allocation';
export const ALLOCATION_ITEMS_KEY = getLocalStorageKey(allocationPrefix, 'items');
export const ALLOCATION_REWARDS_FOR_PROJECTS = getLocalStorageKey(
  allocationPrefix,
  'rewardsForProjects',
);

const projectsPrefix = 'projects';
export const PROJECTS_ADDRESSES_RANDOMIZED_ORDER = getLocalStorageKey(
  projectsPrefix,
  'addressesRandomizedOrder',
);

const onboardingPrefix = 'onboarding';
export const IS_ONBOARDING_DONE = getLocalStorageKey(onboardingPrefix, 'isOnboardingDone');
export const HAS_ONBOARDING_BEEN_CLOSED = getLocalStorageKey(
  onboardingPrefix,
  'hasOnboardingBeenClosed',
);
export const LAST_SEEN_STEP = getLocalStorageKey(onboardingPrefix, 'lastSeenStep');

const settingsPrefix = 'settings';
export const IS_ONBOARDING_ALWAYS_VISIBLE = getLocalStorageKey(
  settingsPrefix,
  'isOnboardingAlwaysVisible',
);
export const DISPLAY_CURRENCY = getLocalStorageKey(settingsPrefix, 'displayCurrency');

export const ARE_OCTANT_TIPS_ALWAYS_VISIBLE = getLocalStorageKey(
  settingsPrefix,
  'areOctantTipsAlwaysVisible',
);

export const IS_CRYPTO_MAIN_VALUE_DISPLAY = getLocalStorageKey(
  settingsPrefix,
  'isCryptoMainValueDisplay',
);

export const IS_DELEGATION_IN_PROGRESS = getLocalStorageKey(
  settingsPrefix,
  'isDelegationInProgress',
);

export const IS_DELEGATION_COMPLETED = getLocalStorageKey(settingsPrefix, 'isDelegationCompleted');

export const DELEGATION_PRIMARY_ADDRESS = getLocalStorageKey(
  settingsPrefix,
  'delegationPrimaryAddress',
);

export const DELEGATION_SECONDARY_ADDRESS = getLocalStorageKey(
  settingsPrefix,
  'delegationSecondaryAddress',
);

export const PRIMARY_ADDRESS_SCORE = getLocalStorageKey(settingsPrefix, 'primaryAddressScore');

export const SECONDARY_ADDRESS_SCORE = getLocalStorageKey(settingsPrefix, 'secondaryAddressScore');

const tipTilesPrefix = 'tipTiles';
export const WAS_ADD_FAVOURITES_ALREADY_CLOSED_TIP = getLocalStorageKey(
  tipTilesPrefix,
  'wasAddFavouritesAlreadyClosed',
);

export const WAS_CONNECT_WALLET_ALREADY_CLOSED_TIP = getLocalStorageKey(
  tipTilesPrefix,
  'wasConnectWalletAlreadyClosed',
);

export const WAS_LOCK_GLM_ALREADY_CLOSED_TIP = getLocalStorageKey(
  tipTilesPrefix,
  'wasLockGLMAlreadyClosed',
);

export const WAS_REWARDS_ALREADY_CLOSED_TIP = getLocalStorageKey(
  tipTilesPrefix,
  'wasRewardsAlreadyClosed',
);

export const WAS_WITHDRAW_ALREADY_CLOSED_TIP = getLocalStorageKey(
  tipTilesPrefix,
  'wasWithdrawAlreadyClosed',
);

export const WAS_ALLOCATE_REWARDS_ALREADY_CLOSED_TIP = getLocalStorageKey(
  tipTilesPrefix,
  'wasAllocateRewardsAlreadyClosed',
);

export const WAS_UQ_TOO_LOW_ALREADY_CLOSED_TIP = getLocalStorageKey(
  tipTilesPrefix,
  'wasUqTooLowAlreadyClosed',
);
