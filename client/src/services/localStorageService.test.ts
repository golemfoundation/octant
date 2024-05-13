import {
  ALLOCATION_ITEMS_KEY,
  ALLOCATION_REWARDS_FOR_PROJECTS,
  DISPLAY_CURRENCY,
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_CRYPTO_MAIN_VALUE_DISPLAY,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
  LAST_SEEN_STEP,
  WAS_ADD_FAVOURITES_ALREADY_CLOSED_TIP,
  WAS_CONNECT_WALLET_ALREADY_CLOSED_TIP,
  WAS_LOCK_GLM_ALREADY_CLOSED_TIP,
  WAS_REWARDS_ALREADY_CLOSED_TIP,
  WAS_WITHDRAW_ALREADY_CLOSED_TIP,
} from 'constants/localStorageKeys';

import localStorageService from './localStorageService';

describe('LocalStorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('init', () => {
    it('should validate localStorage JSONs', () => {
      localStorage.setItem('someKey', 'invalid-json');
      localStorage.setItem('anotherKey', '{"valid": "json"}');
      localStorageService.init();
      expect(localStorage.getItem('someKey')).toBe(null);
      expect(localStorage.getItem('anotherKey')).toBe('{"valid": "json"}');
    });

    it('should validate allocation items', () => {
      localStorage.setItem(ALLOCATION_ITEMS_KEY, '[1, "2", true]');
      localStorageService.init();
      expect(localStorage.getItem(ALLOCATION_ITEMS_KEY)).toBe(null);
    });

    it('should validate isOnboardingAlwaysVisible', () => {
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'not-a-boolean');
      localStorageService.init();
      expect(localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE)).toBe('false');
    });

    it('should validate isOnboardingDone', () => {
      localStorage.setItem(IS_ONBOARDING_DONE, 'not-a-boolean');
      localStorageService.init();
      expect(localStorage.getItem(IS_ONBOARDING_DONE)).toBe('false');
    });

    it('should validate hasOnboardingBeenClosed', () => {
      localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'not-a-boolean');
      localStorageService.init();
      expect(localStorage.getItem(HAS_ONBOARDING_BEEN_CLOSED)).toBe('false');
    });

    it('should validate lastSeenStep', () => {
      localStorage.setItem(LAST_SEEN_STEP, 'not-a-number');
      localStorageService.init();
      expect(localStorage.getItem(LAST_SEEN_STEP)).toBe('0');
    });

    it('should validate displayCurrency', () => {
      localStorage.setItem(DISPLAY_CURRENCY, 'invalid-currency');
      localStorageService.init();
      expect(localStorage.getItem(DISPLAY_CURRENCY)).toBe('"usd"');
    });

    it('should validate isCryptoMainValueDisplay', () => {
      localStorage.setItem(IS_CRYPTO_MAIN_VALUE_DISPLAY, 'not-a-boolean');
      localStorageService.init();
      expect(localStorage.getItem(IS_CRYPTO_MAIN_VALUE_DISPLAY)).toBe('true');
    });

    it('should validate wasAddFavouritesAlreadyClosed', () => {
      localStorage.setItem(WAS_ADD_FAVOURITES_ALREADY_CLOSED_TIP, 'not-a-boolean');
      localStorageService.init();
      expect(localStorage.getItem(WAS_ADD_FAVOURITES_ALREADY_CLOSED_TIP)).toBe('false');
    });

    it('should validate wasConnectWalletAlreadyClosed', () => {
      localStorage.setItem(WAS_CONNECT_WALLET_ALREADY_CLOSED_TIP, 'not-a-boolean');
      localStorageService.init();
      expect(localStorage.getItem(WAS_CONNECT_WALLET_ALREADY_CLOSED_TIP)).toBe('false');
    });

    it('should validate wasLockGLMAlreadyClosed', () => {
      localStorage.setItem(WAS_LOCK_GLM_ALREADY_CLOSED_TIP, 'not-a-boolean');
      localStorageService.init();
      expect(localStorage.getItem(WAS_LOCK_GLM_ALREADY_CLOSED_TIP)).toBe('false');
    });

    it('should validate wasRewardsAlreadyClosed', () => {
      localStorage.setItem(WAS_REWARDS_ALREADY_CLOSED_TIP, 'not-a-boolean');
      localStorageService.init();
      expect(localStorage.getItem(WAS_REWARDS_ALREADY_CLOSED_TIP)).toBe('false');
    });

    it('should validate wasWithdrawAlreadyClosed', () => {
      localStorage.setItem(WAS_WITHDRAW_ALREADY_CLOSED_TIP, 'not-a-boolean');
      localStorageService.init();
      expect(localStorage.getItem(WAS_WITHDRAW_ALREADY_CLOSED_TIP)).toBe('false');
    });

    it('should validate rewardsForProjects', () => {
      localStorage.setItem(ALLOCATION_REWARDS_FOR_PROJECTS, 'not-a-bignumber');
      localStorageService.init();
      expect(localStorage.getItem(ALLOCATION_REWARDS_FOR_PROJECTS)).toBe(
        JSON.stringify(BigInt(0).toString()),
      );

      const bigInt100Stringified = JSON.stringify(BigInt(100).toString());
      localStorage.setItem(ALLOCATION_REWARDS_FOR_PROJECTS, bigInt100Stringified);
      localStorageService.init();
      expect(localStorage.getItem(ALLOCATION_REWARDS_FOR_PROJECTS)).toBe(bigInt100Stringified);
    });
  });
});
