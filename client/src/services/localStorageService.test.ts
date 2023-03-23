import {
  ALLOCATION_ITEMS_KEY,
  DISPLAY_CURRENCY,
  IS_CRYPTO_MAIN_VALUE_DISPLAY,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
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
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'true');
      localStorage.setItem(IS_ONBOARDING_DONE, 'not-a-boolean');
      localStorageService.init();
      expect(localStorage.getItem(IS_ONBOARDING_DONE)).toBe('false');
    });

    it('should validate isOnboardingDone', () => {
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      localStorageService.init();
      expect(localStorage.getItem(IS_ONBOARDING_DONE)).toBe('true');
    });

    it('should validate isOnboardingDone', () => {
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
      localStorage.setItem(IS_ONBOARDING_DONE, 'false');
      localStorageService.init();
      expect(localStorage.getItem(IS_ONBOARDING_DONE)).toBe('false');
    });

    it('should validate displayCurrency', () => {
      localStorage.setItem(DISPLAY_CURRENCY, 'invalid-currency');
      localStorageService.init();
      expect(localStorage.getItem(DISPLAY_CURRENCY)).toBe('usd');
    });

    it('should validate isCryptoMainValueDisplay', () => {
      localStorage.setItem(IS_CRYPTO_MAIN_VALUE_DISPLAY, 'not-a-boolean');
      localStorageService.init();
      expect(localStorage.getItem(IS_CRYPTO_MAIN_VALUE_DISPLAY)).toBe('true');
    });
  });
});
