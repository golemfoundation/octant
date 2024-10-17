import {
  DISPLAY_CURRENCY,
  IS_CRYPTO_MAIN_VALUE_DISPLAY,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  SHOW_HELP_VIDEOS,
} from 'constants/localStorageKeys';

import useSettingsStore from './store';

describe('useSettingsStore', () => {
  afterEach(() => {
    const { reset } = useSettingsStore.getState();
    localStorage.clear();
    reset();
  });

  it('should reset the state', () => {
    const {
      setIsCryptoMainValueDisplay,
      setDisplayCurrency,
      setIsAllocateOnboardingAlwaysVisible,
      setShowHelpVideos,
      reset,
    } = useSettingsStore.getState();

    setIsCryptoMainValueDisplay(false);
    setDisplayCurrency('jpy');
    setIsAllocateOnboardingAlwaysVisible(true);
    setShowHelpVideos(false);
    expect(useSettingsStore.getState().data.isCryptoMainValueDisplay).toEqual(false);
    expect(useSettingsStore.getState().data.displayCurrency).toEqual('jpy');
    expect(useSettingsStore.getState().data.isAllocateOnboardingAlwaysVisible).toEqual(true);
    expect(useSettingsStore.getState().data.showHelpVideos).toEqual(false);
    reset();
    expect(useSettingsStore.getState().data.isCryptoMainValueDisplay).toEqual(true);
    expect(useSettingsStore.getState().data.displayCurrency).toEqual('usd');
    expect(useSettingsStore.getState().data.isAllocateOnboardingAlwaysVisible).toEqual(false);
    expect(useSettingsStore.getState().data.showHelpVideos).toEqual(true);
  });

  it('should set display currency in localStorage and state', () => {
    const { setDisplayCurrency } = useSettingsStore.getState();
    const displayCurrency = 'usd';

    setDisplayCurrency(displayCurrency);
    expect(localStorage.getItem(DISPLAY_CURRENCY)).toEqual(JSON.stringify(displayCurrency));
    expect(useSettingsStore.getState().data.displayCurrency).toEqual(displayCurrency);
  });

  it('should set isAllocateOnboardingAlwaysVisible in localStorage and state', () => {
    const { setIsAllocateOnboardingAlwaysVisible } = useSettingsStore.getState();
    const isAllocateOnboardingAlwaysVisible = true;

    setIsAllocateOnboardingAlwaysVisible(isAllocateOnboardingAlwaysVisible);
    expect(localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE)).toEqual(
      JSON.stringify(isAllocateOnboardingAlwaysVisible),
    );
    expect(useSettingsStore.getState().data.isAllocateOnboardingAlwaysVisible).toEqual(
      isAllocateOnboardingAlwaysVisible,
    );
  });

  it('should set isCryptoMainValueDisplay in localStorage and state', () => {
    const { setIsCryptoMainValueDisplay } = useSettingsStore.getState();
    const isCryptoMainValueDisplay = true;

    setIsCryptoMainValueDisplay(isCryptoMainValueDisplay);
    expect(localStorage.getItem(IS_CRYPTO_MAIN_VALUE_DISPLAY)).toEqual(
      JSON.stringify(isCryptoMainValueDisplay),
    );
    expect(useSettingsStore.getState().data.isCryptoMainValueDisplay).toEqual(
      isCryptoMainValueDisplay,
    );
  });

  it('should set values from localStorage in state', () => {
    const { setValuesFromLocalStorage } = useSettingsStore.getState();
    const displayCurrency = 'usd';
    const isAllocateOnboardingAlwaysVisible = true;
    const isCryptoMainValueDisplay = true;

    localStorage.setItem(DISPLAY_CURRENCY, JSON.stringify(displayCurrency));
    localStorage.setItem(
      IS_ONBOARDING_ALWAYS_VISIBLE,
      JSON.stringify(isAllocateOnboardingAlwaysVisible),
    );
    localStorage.setItem(IS_CRYPTO_MAIN_VALUE_DISPLAY, JSON.stringify(isCryptoMainValueDisplay));
    expect(useSettingsStore.getState().meta.isInitialized).toEqual(false);
    setValuesFromLocalStorage();
    expect(useSettingsStore.getState().meta.isInitialized).toEqual(true);
    expect(useSettingsStore.getState().data.displayCurrency).toEqual(displayCurrency);
    expect(useSettingsStore.getState().data.isAllocateOnboardingAlwaysVisible).toEqual(
      isAllocateOnboardingAlwaysVisible,
    );
    expect(useSettingsStore.getState().data.isCryptoMainValueDisplay).toEqual(
      isCryptoMainValueDisplay,
    );
  });

  it('should set showHelpVideos in localStorage and state', () => {
    const { setShowHelpVideos } = useSettingsStore.getState();
    const showHelpVideos = true;

    setShowHelpVideos(showHelpVideos);
    expect(localStorage.getItem(SHOW_HELP_VIDEOS)).toEqual(JSON.stringify(showHelpVideos));
    expect(useSettingsStore.getState().data.showHelpVideos).toEqual(showHelpVideos);
  });
});
